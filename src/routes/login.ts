import * as cheerio from "cheerio";
import { Request, Response } from "express";
import got from "got";
import NodeRSA from "node-rsa";
import { CookieJar } from "tough-cookie";

const getFormData = (body: string, formName: string) => {
  const dom = cheerio.load(body);
  const data: { [key: string]: string } = {};
  for (const input of dom(formName).find("input")) {
    data[input.attribs.name] = input.attribs.value ? input.attribs.value : "";
  }

  const url = dom(formName).attr("action");

  return { data, url };
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      result: false,
      message: "username or password is missing",
    });
  }

  // if($("#btnLogin").text() == "로그인") {
  //   document.frmSSO.ssoGubun.value = "Login";
  //   document.frmSSO.submit();
  // }

  // <form name="frmSSO" id="frmSSO" method="post" action="/main/SSOLegacy.do">
  //   <input type="hidden"   name="retUrl"    value="" />
  //   <input type="hidden"   name="failUrl"   value="" />
  //   <input type="hidden"   name="ssoGubun"   value="Redirect" />
  //   <input type="hidden"   name="test"   value="SSOLogin" />
  //   <input type="hidden"   name="loginProcUrl"   value="/main/index.jsp" />
  // </form>

  const cookieJar = new CookieJar();

  let response = await got.post(
    "https://portal.yonsei.ac.kr/main/SSOLegacy.do",
    {
      form: {
        retUrl: "",
        failUrl: "",
        ssoGubun: "Login",
        test: "SSOLogin",
        loginProcUrl: "/main/index.jsp",
      },
      headers: {
        Referer: "https://portal.yonsei.ac.kr/main/",
      },
      cookieJar,
    }
  );

  let formData = getFormData(response.body, "#frmSSO");
  if (!formData.url) {
    return res.status(500).json({
      result: false,
      message: "login form not found",
    });
  }

  response = await got.post(formData.url, {
    form: formData.data,
    cookieJar,
    headers: {
      Referer: "https://portal.yonsei.ac.kr/",
    },
  });

  const ssoChallengeRegex = /var ssoChallenge ?= ?['"](.*?)['"]/g.exec(
    response.body
  );

  if (!ssoChallengeRegex || ssoChallengeRegex.length != 2) {
    return res.status(500).json({
      result: false,
      message: "ssoChallenge not found",
    });
  }

  const ssoChallenge = ssoChallengeRegex[1];

  const publicKeyRegex =
    /rsa\.setPublic\(\s?['"](.*?)['"],\s?['"](.*?)['"]\s?\)/g.exec(
      response.body
    );

  if (!publicKeyRegex || publicKeyRegex.length != 3) {
    return res.status(500).json({
      result: false,
      message: "publicKey not found",
    });
  }

  const publicKey = publicKeyRegex[1];
  const modulus = publicKeyRegex[2];

  const encryptData = {
    userid: username,
    userpw: password,
    ssoChallenge,
  };

  const rsaKey = new NodeRSA();
  rsaKey.importKey(
    {
      n: Buffer.from(publicKey, "hex"),
      e: parseInt(modulus, 16),
    },
    "components-public"
  );
  rsaKey.setOptions({ encryptionScheme: "pkcs1" });

  formData = getFormData(response.body, "#ssoLoginForm");
  formData.data["E2"] = rsaKey
    .encrypt(
      Buffer.from(
        JSON.stringify(encryptData).replaceAll(":", ": ").replaceAll(",", ", "),
        "utf-8"
      )
    )
    .toString("hex");

  response = await got.post("https://infra.yonsei.ac.kr/sso/PmSSOAuthService", {
    form: formData.data,
    cookieJar,
    headers: {
      Referer: "https://infra.yonsei.ac.kr/sso/PmSSOService",
    },
  });

  formData = getFormData(response.body, "#ssoLoginForm");
  if (
    response.body.includes("입력하신 아이디 혹은 비밀번호가 일치하지 않습니다.")
  ) {
    return res.status(403).json({
      result: false,
      message: "username or password is wrong",
    });
  }

  if (!formData.url) {
    return res.status(500).json({
      result: false,
      message: "login form not found",
    });
  }

  response = await got.post(formData.url, {
    form: formData.data,
    cookieJar,
    headers: {
      Referer: "https://infra.yonsei.ac.kr/",
    },
  });

  response = await got.get(
    "https://underwood1.yonsei.ac.kr/haksa/sso/main.jsp",
    {
      cookieJar,
    }
  );

  formData = getFormData(response.body, "#frmSSO");
  if (!formData.url) {
    return res.status(500).json({
      result: false,
      message: "login form not found on underwood1",
    });
  }

  response = await got.post(formData.url, {
    form: formData.data,
    cookieJar,
    headers: {
      Referer: "https://underwood1.yonsei.ac.kr/",
    },
  });

  formData = getFormData(response.body, "#ssoLoginForm");
  if (!formData.url) {
    return res.status(500).json({
      result: false,
      message: "sso login form not found on underwood1",
    });
  }

  response = await got.post(formData.url, {
    form: formData.data,
    cookieJar,
    headers: {
      Referer: "https://infra.yonsei.ac.kr/",
    },
  });

  formData = getFormData(response.body, "#frmSSO");
  if (!formData.url) {
    return res.status(500).json({
      result: false,
      message: "frmSSO not found on underwood1",
    });
  }

  response = await got.post(formData.url, {
    form: formData.data,
    cookieJar,
    headers: {
      Referer: "https://underwood1.yonsei.ac.kr:8443/",
    },
  });

  formData = getFormData(response.body, "#ssoLoginForm");
  if (!formData.url) {
    return res.status(500).json({
      result: false,
      message: "ssoLoginForm not found on underwood1",
    });
  }

  response = await got.post(formData.url, {
    form: formData.data,
    cookieJar,
    headers: {
      Referer: "https://underwood1.yonsei.ac.kr:8443/",
    },
  });

  response = await got.post(
    "https://underwood1.yonsei.ac.kr:8443/haksa/act/HJ/gr/GR_S070M.jsp",
    {
      json: {
        dc_req: {
          hakbun: "",
          domain: "",
          sosok: "",
          name: "",
          major1: "",
          major2: "",
          major3: "",
          ymajor: "",
          minor1nm: "",
          minor1: "",
          minor2: "",
          etc: "",
          latest_date: "",
          appyear: "",
          flag: "req",
          status: "",
        },
      },
      cookieJar,
      headers: {
        Referer:
          "https://underwood1.yonsei.ac.kr:8443/haksa/websquare/websquare.html?w2xPath=/haksa/wq/main.xml",
      },
    }
  );

  const studentData = JSON.parse(response.body);
  response = await got.post(
    "https://underwood1.yonsei.ac.kr:8443/haksa/act/HJ/gr/GR_S070M.jsp",
    {
      json: {
        dc_req: {
          hakbun: studentData.data.hakbun,
          domain: studentData.data.domain,
          sosok: studentData.data.sosok,
          name: studentData.data.name,
          major1: studentData.data.major1 ? studentData.data.major1 : "",
          major2: studentData.data.major2 ? studentData.data.major2 : "",
          major3: studentData.data.major3 ? studentData.data.major3 : "",
          ymajor: studentData.data.ymajor ? studentData.data.ymajor : "",
          minor1nm: studentData.data.minor1nm ? studentData.data.minor1nm : "",
          minor1: studentData.data.minor1 ? studentData.data.minor1 : "",
          minor2: studentData.data.minor2 ? studentData.data.minor2 : "",
          etc: studentData.data.etc,
          latest_date: studentData.data.latest_date,
          appyear: studentData.data.appyear,
          flag: "mainList",
          status: "success",
        },
      },
      cookieJar,
      headers: {
        Referer:
          "https://underwood1.yonsei.ac.kr:8443/haksa/websquare/websquare.html?w2xPath=/haksa/wq/main.xml",
      },
    }
  );

  const pointData = JSON.parse(response.body);

  const totalData = pointData.data.find(
    (e: any) => e.axisnm == "이수기준학점(A)"
  );
  const remainData = pointData.data.find((e: any) => e.axisnm == "총잔여학점");

  response = await got.post(
    "https://underwood1.yonsei.ac.kr:8443/haksa/act/HJ/hj/HJ_C010M.jsp",
    {
      json: { dc_req_hjc010_search: { flag: "hj_c010_search", lang: "ko" } },
      cookieJar,
      headers: {
        Referer:
          "https://underwood1.yonsei.ac.kr:8443/haksa/websquare/websquare.html?w2xPath=/haksa/wq/main.xml",
      },
    }
  );

  const basicData = JSON.parse(response.body);

  return res.json({
    result: true,
    total: totalData.habkye,
    remain: remainData.habkye,
    grade: basicData.data.HAKYOUN,
  });
};

export default login;
