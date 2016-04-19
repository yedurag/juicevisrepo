# 4/16/2016 8:04 PM
# author - yedurag babu (yzb0005@tigermail.auburn.edu)
# app.py

# the app file for the flask app




# importing required libraries
from flask import Flask, render_template, request,jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from rq import Queue
from rq.job import Job
from worker import conn

import json
import requests
import os
import time
import datetime
from nltk.stem.porter import *

from collections import Counter
import operator

stemmer = PorterStemmer()


# configs
app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
appId = "[YourAppID]"
appKey = "[YourAppKey]"
db = SQLAlchemy(app)

q = Queue(connection=conn)

# we have the db model stored in models.py
from models import *


# helper function 1- to iterate through urls and get data from api
# generates a list of limits
# makes the urls dynamically
# iterates through the urls and gets the data using requests
def reqData(brandId,appId,appKey):
    startPage = 0
    endPage = startPage + 50
    listResults = []

    # right now there are only 125 juicy juice items; what if in the future they expand their portfolio
    while True:
        
        url = "https://api.nutritionix.com/v1_1/search/?brand_id=" + brandId + "&results=" + str(startPage)+ "%3A" + str(endPage)+ "&cal_min=0&cal_max=50000&fields=*&appId=" + appId + "&appKey=" + appKey
             
        response = (requests.get(url)).json()


        if response["hits"] == []:
            break
        else:
            hitsResults = [{"item_id" : m['fields']['item_id'],
                            "item_name": m['fields']['item_name'],
                            "item_description": m['fields']['item_description'],
                            "updated_at": m['fields']['updated_at'],
                            "ingredient_statement": m['fields']['nf_ingredient_statement'],
                            "calories": m['fields']['nf_calories'],
                            "calories_from_fat": m['fields']['nf_calories_from_fat'],
                            "total_fat": m['fields']['nf_total_fat'],
                            "saturated_fat": m['fields']['nf_saturated_fat'],
                            "trans_fatty_acid": m['fields']['nf_trans_fatty_acid'],
                            "polyunsaturated_fat": m['fields']['nf_polyunsaturated_fat'],
                            "monounsaturated_fat": m['fields']['nf_monounsaturated_fat'],
                            "cholesterol": m['fields']['nf_cholesterol'],
                            "sodium": m['fields']['nf_sodium'],
                            "total_carbohydrate": m['fields']['nf_total_carbohydrate'],
                            "dietary_fiber": m['fields']['nf_dietary_fiber'],
                            "sugars": m['fields']['nf_sugars'],
                            "protein": m['fields']['nf_protein'],
                            "vitamin_a_dv": m['fields']['nf_vitamin_a_dv'],
                            "vitamin_c_dv": m['fields']['nf_vitamin_c_dv'],
                            "calcium_dv": m['fields']['nf_calcium_dv'],
                            "iron_dv": m['fields']['nf_iron_dv'],
                            "servings_per_container": m['fields']['nf_servings_per_container'],
                            "serving_size_qty": m['fields']['nf_serving_size_qty'],
                            "serving_size_unit": m['fields']['nf_serving_size_unit'],
                            "serving_weight_grams": m['fields']['nf_serving_weight_grams'],
                            "full_ingredient": "Missing Info", "main-ingredient":"Missing Info",
                            "calperunitserving": float(0),"vitamincperunitserving": float(0),"flavor":"Other","carbsperunitserving":float(0)} for m in response["hits"] if m["_type"]=="item"]
            # the keys- full_ingredient,calperunitserving, carbsperunitserving, flavor and ingredient are not updated; we will update them later
            listResults.append(hitsResults)
            startPage = startPage + 50

            endPage = startPage + 50
        

    listResults = [i for o in listResults for i in o]

    return listResults


# helper function 2- to clean up the numeric fields
# input = results pulled from the api
# output = cleaned up data for numeric fields based on the assumption from api documentation: if field is null, its unknown
# most apps have to attribute value of zero to these data points
# cleans up the time field; calculates calories per serving quantity
# along with that to beautify things, i have added an attribute called flavor :)

def cleannumericData(listResults=[]):
    listNumericfields = ["calories","calories_from_fat",
                            "total_fat", 
                            "saturated_fat",
                            "trans_fatty_acid", 
                            "polyunsaturated_fat",
                            "monounsaturated_fat", 
                            "cholesterol", 
                            "sodium",
                            "total_carbohydrate",
                            "dietary_fiber",
                            "sugars",
                            "protein",
                            "vitamin_a_dv", 
                            "vitamin_c_dv",
                            "calcium_dv",
                            "iron_dv", 
                            "servings_per_container", 
                            "serving_size_qty"]

    for eachItem in listResults:
        for eachNumericfield in listNumericfields:
            if eachItem[eachNumericfield] is None:
                eachItem[eachNumericfield] = 0
    for eachItem in listResults:
        eachItem["updated_at"] = (datetime.datetime.strptime((eachItem["updated_at"].encode('utf-8'))[:-5],"%Y-%m-%dT%H:%M:%S")).strftime('%Y-%m-%d %H:%M:%S')

        if eachItem["serving_size_qty"] != 0:
            eachItem["calperunitserving"] = eachItem["calories"]/float(eachItem["serving_size_qty"])

        if eachItem["serving_size_qty"] != 0:
            eachItem["carbsperunitserving"] = eachItem["total_carbohydrate"]/float(eachItem["serving_size_qty"])

        if eachItem["serving_size_qty"] != 0:
            eachItem["vitamincperunitserving"] = eachItem["vitamin_c_dv"]/float(eachItem["serving_size_qty"])

        # Giving a flavor attribute to it (this is defined by myself; Trying to categorize; Items may come in multiple- not taken into account
        if "berry" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Berries"
        elif "melon" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Melon"

        elif "grape" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Grape"

        elif "orange" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Orange"

        elif "peach" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Peach"

        elif "mango" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Mango"

        elif "apple" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Apple"

        elif "pineapple" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Pine Apple"

        elif "cherry" in (eachItem["item_name"]).lower():
            eachItem["flavor"] = "Cherry"

        else:
            eachItem["flavor"] = "Other"
            

        

        
            
            
            
        
                

    return listResults




# helper function 3- very important - to clean up the ingredients field
# the function is a little complex with several steps
# i have tried to comment; please email me with questions
# input = results after numeric cleaning
# output = a new cleaned up list of ingredients field; list of all ingredients with counts
# nltk stemmer and stop words also used

def cleanIngredients(listResults=[]):
    # i did not like the none's; replaced them with ''
    for eachItem in listResults:
        if eachItem["ingredient_statement"] is None:
            eachItem["ingredient_statement"] = ''
            
    # first level of cleaning; removing ands and "."
    for eachItem in listResults:
        line = (eachItem["ingredient_statement"]).lower()
        line = line.replace('and', ',')
        line = line.replace(',,', ',')
        line = line.replace(', ,', ',')
        line = line.rstrip('.')
        # second level of cleaning; to make it truely comma delimited
        # modified the ingenious solution given in http://stackoverflow.com/questions/14596884/remove-text-between-and-in-python
        startChar = line.find('(')
        endChar = line.find(')')
        if startChar != -1 and endChar != -1:
            line = line.replace("("+line[startChar+1:endChar]+")",("( "+line[startChar+1:endChar]+" )").replace(',',''))
            
        # third level; stemming the results and normalizing it
        listIngredients = line.split(',')
        refinedlistIngredients =  []
        for ingredient in listIngredients:
            # if the word "puree" is stemmed it becomes "pure" which may be misleading
            refinedlistIngredients.append(" ".join([word if word == 'puree' else stemmer.stem(word) for word in ingredient.split()]))
             
        # for each items, we have a list of ingredients
        eachItem["ingredients_list"] = refinedlistIngredients
        
        # skipped the block below after realising the stupidity
        """
        # we consolidate all these ingredients to a single list
        if eachItem["ingredient_statement"] != "":
            totallistIngredients.append(refinedlistIngredients)


    totallistIngredients = [i for o in totallistIngredients for i in o]
    
    # in the big list of ingredients, we uniquefy and sort it; get the counts too
    listAllingredients = Counter(totallistIngredients)
    listAllingredients = sorted(listAllingredients.items(),key=operator.itemgetter(1),reverse=True)
    """
    return {"data": listResults}

# helper function 4- very important - to get the ingredients table
# the function is a little complex with several steps
# input: results from cleanIngredients function
# output: results array with each ingredient and the matching item information
# for each of the item, we have ingredients list; the data here is converted into a long format

def ingredientsMatch(fullData):
    listResults = fullData["data"]
    outputingredientsMatch = []
    
    outputingredientsNotmatch = [i for i in listResults if i['ingredient_statement'] == '']
    outputingredientspresent = [i for i in listResults if i['ingredient_statement'] != '']

    for item in outputingredientspresent:
        ingList = item["ingredients_list"]
        for eachIng in ingList:
            outputingredientsMatch.append({"item_id": item["item_id"],
                                            "item_name": item["item_name"],
                                            "item_description": item["item_description"],
                                            "updated_at": item["updated_at"],
                                            "ingredient_statement": item["ingredient_statement"],
                                            "calories": item["calories"],
                                            "calories_from_fat": item["calories_from_fat"],
                                            "total_fat": item["total_fat"],
                                            "saturated_fat": item["saturated_fat"],
                                            "trans_fatty_acid": item["trans_fatty_acid"],
                                            "polyunsaturated_fat": item["polyunsaturated_fat"],
                                            "monounsaturated_fat": item["monounsaturated_fat"],
                                            "cholesterol": item["cholesterol"],
                                            "sodium": item["sodium"],
                                            "total_carbohydrate": item["total_carbohydrate"],
                                            "dietary_fiber": item["dietary_fiber"],
                                            "sugars": item["sugars"],
                                            "protein": item["protein"],
                                            "vitamin_a_dv": item["vitamin_a_dv"],
                                            "vitamin_c_dv": item["vitamin_c_dv"],
                                            "calcium_dv": item["calcium_dv"],
                                            "iron_dv": item["iron_dv"],
                                            "servings_per_container": item["servings_per_container"],
                                            "serving_size_qty": item["serving_size_qty"],
                                            "serving_size_unit": item["serving_size_unit"],
                                            "serving_weight_grams": item["serving_weight_grams"],
                                            "full_ingredient": eachIng,
                                            "main-ingredient": " ".join([word for word in (eachIng.split())[:2]]),
                                            "ingredients_list": item["ingredients_list"],
                                           "calperunitserving": float(item["calperunitserving"]),"flavor": item["flavor"],
                                           "vitamincperunitserving": float(item["vitamincperunitserving"]),
                                           "carbsperunitserving": float(item["carbsperunitserving"])})
            





    

    outputingredientsData = outputingredientsMatch + outputingredientsNotmatch
            
             

            

    return outputingredientsData



# powering the front page                
@app.route('/', methods=['GET', 'POST'])
def indexPage():
    return render_template('index.html')

# powering the products page
@app.route('/products', methods=['GET', 'POST'])
def productsPage():
    return render_template('products.html')


# powering the ingredients page
@app.route('/ingredients', methods=['GET', 'POST'])
def ingredientsPage():
    return render_template('ingredients.html')


# powering the process book page
@app.route('/processbook', methods=['GET', 'POST'])
def processbookPage():
    return render_template('processbook.html')


# gets the data--> cleaned product data-->insert and commit to db-->returns the id 
def workonStartproducts(listArguments):
    brandId = listArguments[0]
    appId = listArguments[1]
    appKey = listArguments[2]
    try:
        a = reqData(brandId,appId,appKey)
        b = cleannumericData(a)
        results = b
        result = Result(result_all=results)
        db.session.add(result)
        db.session.commit()
        return result.id
    except:
        errors = {"errors": "data pull failed"}
        return errors

# gets the data--> cleaned ingredients data-->insert and commit to db-->returns the id  
def workonStartingredients(listArguments):
    brandId = listArguments[0]
    appId = listArguments[1]
    appKey = listArguments[2]
    try:
        a = reqData(brandId,appId,appKey)
        b = cleannumericData(a)
        c = cleanIngredients(b)
        d = ingredientsMatch(c)
        results = d
        result = Result(result_all=results)
        db.session.add(result)
        db.session.commit()
        return result.id
    except:
        errors = {"errors": "data pull failed"}
        return errors
        
# when this end point is called by the front end, it checks if the job is finished
# if finished it posts the data
@app.route("/resultsProducts/<job_key>", methods=['GET'])
def get_productResults(job_key):
    job = Job.fetch(job_key, connection=conn)
    if job.is_finished:
        result = Result.query.filter_by(id=job.result).first()
        result = result.result_all
        return jsonify({"data":result,"status":"done"})
    else:
        return jsonify({"status":"pending","data":[]})

# similar as above
@app.route("/resultsIngredients/<job_key>", methods=['GET'])
def get_ingredientResults(job_key):
    
    job = Job.fetch(job_key, connection=conn)
    if job.is_finished:
        result = Result.query.filter_by(id=job.result).first()
        result = result.result_all
        return jsonify({"data":result,"status":"done"})
    else:
        return jsonify({"status":"pending","data":[]})






# when the user clicks the brand button on the products page, the post request goes here
# the job is created dynamically and added to the redis q
# the job id from the redis q is our reference here
@app.route("/startproducts",methods = ['GET','POST'])
def startProducts():
    errors = []
    results = []

    if request.method == 'POST':
        brandName = request.form.get('brand')
        if brandName == "Juicy Juice":
            brandId = "51db37d0176fe9790a899db2"
        elif brandName == "Old Orchard 100 Juice":
            brandId = "51db37c9176fe9790a8996c0"
        else:
            brandId = "51db3819176fe9790a89b485"
        argumentList = [brandId,appId, appKey]
        job = q.enqueue_call(func=workonStartproducts, args=(argumentList,), result_ttl=5000)
        
        return job.get_id()
        print job.get_id()
               



# when the user clicks the brand button on the ingredients page, the post request goes here
# working is similar as above
@app.route("/startingredients",methods = ['GET','POST'])
def startIngredients():
    errors = []
    results = []

    if request.method == 'POST':
        brandName = request.form.get('brand')
        if brandName == "Juicy Juice":
            brandId = "51db37d0176fe9790a899db2"
        elif brandName == "Old Orchard 100 Juice":
            brandId = "51db37c9176fe9790a8996c0"
        else:
            brandId = "51db3819176fe9790a89b485"
        argumentList = [brandId,appId, appKey]
        job = q.enqueue_call(func=workonStartingredients, args=(argumentList,), result_ttl=5000)
        
        return job.get_id()
        print job.get_id()
            
               



if __name__ == '__main__':
    app.run()
                
           
                
                
                
        

    
        
        
        
    

    




    
            






    

    
        

        
        
        

    

    
    
