# 4/16/2016
# 1:51 PM
# Author - Yedurag Babu (yzb0005@tigermail.auburn.edu)
# to clean up the ingredients data
# importing required libraries
import json
import requests
import csv
import re
from nltk.stem.porter import *
stemmer = PorterStemmer()
from nltk.corpus import stopwords

cachedStopWords = stopwords.words("english")

# url for get requests
url1 = """https://api.nutritionix.com/v1_1/search/?brand_id=51db37d0176fe9790a899db2&results=0%3A50&cal_min=0&cal_max=50000&fields=*&appId=[]&appKey=[]"""
url2 = """https://api.nutritionix.com/v1_1/search/?brand_id=51db37d0176fe9790a899db2&results=50%3A100&cal_min=0&cal_max=50000&fields=*&appId=[]&appKey=[]"""
url3 = """https://api.nutritionix.com/v1_1/search/?brand_id=51db37d0176fe9790a899db2&results=100%3A150&cal_min=0&cal_max=50000&fields=*&appId=[]&appKey=[]"""

#list of urls

urlList = [url1,url2,url3]


# using requests library to pull the data

listResponses = [((requests.get(url)).json())for url in urlList]

listResponses = [m["hits"] for m in listResponses]

listResponses = [i for o in listResponses for i in o]

# getting the big list of ingredients only and eliminating Nones also on the fly;making lower case to normalize

listIngredients = [(m['fields']['nf_ingredient_statement']).lower() for m in listResponses if m['fields']['nf_ingredient_statement'] != None]

# first level of cleaning; removing ands and "."


listIngredients = [line.replace('and', ',') for line in listIngredients]
listIngredients = [line.replace(',,', ',') for line in listIngredients]
listIngredients = [line.replace(', ,', ',') for line in listIngredients]
listIngredients = [line.replace('.',',') for line in listIngredients]


# second level to truely make it comma delimited
# modified the ingenious solution given in http://stackoverflow.com/questions/14596884/remove-text-between-and-in-python
refinedlistIngredients = []
for line in listIngredients:
    startChar = line.find('(')
    endChar = line.find(')')
    if startChar != -1 and endChar != -1:
        refinedlistIngredients.append(line.replace("("+line[startChar+1:endChar]+")",("( "+line[startChar+1:endChar]+" )").replace(',','')))
    else:
        refinedlistIngredients.append([line])

# third level to stem the results and truely normalize it
# splitting them based on ',' first

refinedlistIngredients = [line.split(',') for line in refinedlistIngredients]

biglistIngredients = []
for line in refinedlistIngredients:
    for ingredient in line:
        biglistIngredients.append(" ".join([stemmer.stem(word)for word in ingredient.split()]))
        
print len(biglistIngredients)

from collections import Counter
import operator


results1 = Counter(biglistIngredients)
            # save the results
results = sorted(results1.items(),key=operator.itemgetter(1),reverse=True)


print len(results)
    
print results

        

    
    
        
        
    
            





