import pandas as pd
import numpy as np
import sys
import json

user_grade = int(sys.argv[1])
total_credit = int(sys.argv[2])
grad_credit = int(sys.argv[3])
user_subject = int(sys.argv[4])
latest_semester_credit = int(sys.argv[5])
semester_max_credit = int(sys.argv[6])
is_grad = sys.argv[7]
is_first = sys.argv[8]

user_a = total_credit/grad_credit
user_b = latest_semester_credit/semester_max_credit
if user_b > 1:
    user_b = 1

user_data = [user_grade, user_subject, user_a, user_b]

def min_value_mileage (data) :
    grade_data = data[data['학년'] == user_grade]
    subject_data= grade_data[grade_data['신청과목수'] == user_subject]
    is_grad_data = subject_data[subject_data['졸업신청'] == is_grad]
    is_first_data = is_grad_data[is_grad_data['초수강여부'] == is_first]
    available = subject_data[subject_data['수강여부'] == 'O']
    return available.마일리지.min() if not np.isnan(available.마일리지.min()) else -1


data_20221 = pd.read_csv('YCE1255-01-00-20221.csv')


min_value_mileage_1 = min_value_mileage(data_20221)


data_20212 = pd.read_csv('YCE1255-01-00-20212.csv')


min_value_mileage_2 = min_value_mileage (data_20212)


data_20211 = pd.read_csv('YCE1255-01-00-20211.csv')

min_value_mileage_3 = min_value_mileage (data_20211)


data_20202 = pd.read_csv('YCE1255-01-00-20202.csv')


min_value_mileage_4 = min_value_mileage (data_20202)


data_20201 = pd.read_csv('YCE1255-01-00-20201.csv')


min_value_mileage_5 = min_value_mileage (data_20201)

data_20192 = pd.read_csv('YCE1255-01-00-20192.csv')

min_value_mileage_6 = min_value_mileage (data_20192)



total_set = {"2022-1" : min_value_mileage_1 , "2021-2" : min_value_mileage_2, "2021-1" : min_value_mileage_3, "2020-2" : min_value_mileage_4, "2020-1" : min_value_mileage_5 ,"2019-2" : min_value_mileage_6}

dict_20221 = data_20221[data_20221['마일리지'] == min_value_mileage_1].fillna(-1).astype(np.int32).to_dict()
dict_20212 = data_20212[data_20212['마일리지'] == min_value_mileage_2].fillna(-1).astype(np.int32).to_dict()
dict_20211 = data_20211[data_20211['마일리지'] == min_value_mileage_3].fillna(-1).astype(np.int32).to_dict()
dict_20202 = data_20202[data_20202['마일리지'] == min_value_mileage_4].fillna(-1).astype(np.int32).to_dict()
dict_20201 = data_20201[data_20201['마일리지'] == min_value_mileage_5].fillna(-1).astype(np.int32).to_dict()
dict_20192 = data_20192[data_20192['마일리지'] == min_value_mileage_6].fillna(-1).astype(np.int32).to_dict()

result = {
    "total": total_set,
    "20221": dict_20221,
    "20212": dict_20212,
    "20211": dict_20211,
    "20202": dict_20202,
    "20201": dict_20201,
    "20192": dict_20192,
}

print(json.dumps(result, ensure_ascii=False))