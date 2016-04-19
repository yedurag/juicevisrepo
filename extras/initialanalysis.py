# 4/15/2016
# 7:10 PM
# Author - Yedurag Babu (yzb0005@tigermail.auburn.edu)
# to get full data for juicy juice for initial analysis
# importing required libraries
import json
import requests
import csv


# url for get requests
url1 = """https://api.nutritionix.com/v1_1/search/?brand_id=51db37d0176fe9790a899db2&results=150%3A200&cal_min=0&cal_max=50000&fields=*&appId=[YourAPPId]2&appKey=[YourAPPKey]"""

# using requests library to pull the data
results = requests.get(url1)

results = results.json()

# only getting the hits list
hits = results["hits"]

# column heading for the csv file
columnHeadings = [['id','old_api_id',
                    'item_id',
                    'item_name',
                    'brand_id',
                    'brand_name',
                    'item_description',
                    'updated_at',
                    'nf_ingredient_statement',
                    'nf_water_grams',
                    'nf_calories',
                    'nf_calories_from_fat',
                    'nf_total_fat',
                    'nf_saturated_fat',
                    'nf_trans_fatty_acid',
                    'nf_polyunsaturated_fat',
                    'nf_monounsaturated_fat',
                    'nf_cholesterol',
                    'nf_sodium',
                    'nf_total_carbohydrate',
                    'nf_dietary_fiber',
                    'nf_sugars',
                    'nf_protein',
                    'nf_vitamin_a_dv',
                    'nf_vitamin_c_dv',
                    'nf_calcium_dv',
                    'nf_iron_dv',
                    'nf_refuse_pct',
                    'nf_servings_per_container',
                    'nf_serving_size_qty',
                    'nf_serving_size_unit',
                    'nf_serving_weight_grams',
                    'allergen_contains_milk',
                    'allergen_contains_eggs',
                    'allergen_contains_fish',
                    'allergen_contains_shellfish',
                    'allergen_contains_tree_nuts',
                    'allergen_contains_peanuts',
                    'allergen_contains_wheat',
                    'allergen_contains_soybeans',
                    'allergen_contains_gluten']]


# checking for type and storing the ids and all fields

items = [[m["_id"],m['fields']['old_api_id'],
                                m['fields']['item_id'],
                                m['fields']['item_name'],
                                m['fields']['brand_id'],
                                m['fields']['brand_name'],
                                m['fields']['item_description'],
                                m['fields']['updated_at'],
                                m['fields']['nf_ingredient_statement'],
                                m['fields']['nf_water_grams'],
                                m['fields']['nf_calories'],
                                m['fields']['nf_calories_from_fat'],
                                m['fields']['nf_total_fat'],
                                m['fields']['nf_saturated_fat'],
                                m['fields']['nf_trans_fatty_acid'],
                                m['fields']['nf_polyunsaturated_fat'],
                                m['fields']['nf_monounsaturated_fat'],
                                m['fields']['nf_cholesterol'],
                                m['fields']['nf_sodium'],
                                m['fields']['nf_total_carbohydrate'],
                                m['fields']['nf_dietary_fiber'],
                                m['fields']['nf_sugars'],
                                m['fields']['nf_protein'],
                                m['fields']['nf_vitamin_a_dv'],
                                m['fields']['nf_vitamin_c_dv'],
                                m['fields']['nf_calcium_dv'],
                                m['fields']['nf_iron_dv'],
                                m['fields']['nf_refuse_pct'],
                                m['fields']['nf_servings_per_container'],
                                m['fields']['nf_serving_size_qty'],
                                m['fields']['nf_serving_size_unit'],
                                m['fields']['nf_serving_weight_grams'],
                                m['fields']['allergen_contains_milk'],
                                m['fields']['allergen_contains_eggs'],
                                m['fields']['allergen_contains_fish'],
                                m['fields']['allergen_contains_shellfish'],
                                m['fields']['allergen_contains_tree_nuts'],
                                m['fields']['allergen_contains_peanuts'],
                                m['fields']['allergen_contains_wheat'],
                                m['fields']['allergen_contains_soybeans'],
                                m['fields']['allergen_contains_gluten']] for m in hits if m["_type"]=="item"]


# list of items with column headings

listOfitems = columnHeadings + items

# writing to csv file for initial analysis
with open('output1.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerows(listOfitems)
    

print "done"
