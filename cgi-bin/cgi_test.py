#!/usr/bin/env python3
#-*- coding:utf-8 -*-

import cgi
from PIL import Image
from io import BytesIO
import base64
from tensorflow.keras import models
from tensorflow.keras.preprocessing import image
import numpy as np


import cgitb
cgitb.enable()

def judge(input_img, input_model):
    model = models.load_model(input_model)

    # img = image.load_img(input_img, target_size=(224,224,3))
    img = input_img.resize((224,224), Image.LANCZOS)
    img_data = image.img_to_array(img)
    img_data = np.expand_dims(img_data, axis=0)

    features = model.predict_proba(img_data)

    #category_list.txtからカテゴリの一覧を取得する
    category_list = ["プリン", "カービィ"]

    #featuresの中で最も確率が高い番号を取得して、その番号に当てはまるカテゴリを出力する
    max_prob = np.where(features[0]==max(features[0]))[0][0]
    predicted_category = category_list[max_prob]
    return_data = []
    return_data.append(predicted_category)

    for i in range(len(category_list)):
        return_data.append(features[0][i])

    return return_data


######main#######
print("Content-Type: text/html; charset=utf-8\n\n")
form = cgi.FieldStorage()
value = form["sendValue"].value
value = value.replace("data:image/jpeg;base64,", "")
# https://ja.coder.work/so/python/111221
img = Image.open(BytesIO(base64.b64decode(value)))

# 本番環境ではパスを変更
return_data = judge(img, "/Users/shimizushinichi/JigglypuffOrKirby/judge/model_jigglypufforkirby_forJudge.h5")

print("あなたの描いた絵は{}っぽいです。".format(return_data[0]))
