// updated - 4/19/2016 12:08 AM
// author - yedurag babu (yzb0005@tigermail.auburn.edu)
// js code for the ingredients page

$(document).ready(function(){
console.log("ready!");
$('.selectBrand').selectpicker();
$("#datapullAlert").addClass('hidden');
$("#visAll").addClass('hidden');
$('#ajaxLoader').addClass('hidden');


// the loop starts when the user clicks on the brand button.
$('#brandButton').on('click',function(){

$("#ajaxLoader").removeClass('hidden');
 $("#datapullAlert").addClass('hidden');
 $("#visAll").addClass('hidden');
 
 // to prevent multiple clicks
$("#brandButton").text('Data Loading....');
$('#brandButton').prop('disabled', true);

console.log("The brand button has been submitted!");

var valueBrand = $('.selectBrand').find('option:selected').text();


console.log(valueBrand);

// ajax post to the back end
$.ajax({
type: "POST",
url: "/startingredients",
data:{brand: valueBrand},
success: function(results) {
console.log(results);
var jobId='';
jobId = results;	
(function ajax_requestIngredients() {
$.ajax({
					type: "GET",
					url: "/resultsIngredients/" + jobId,
					dataType: "json",
					success:function(xhr_data) {
					// if data not received it pings every 2 seconds	
					if (xhr_data.status =='pending'){
							console.log("Waiting for response");
							setTimeout(ajax_requestIngredients, 2000);   
						} else {
						// the data is received and we can start the vis	
						console.log(xhr_data)
						$("#ajaxLoader").addClass('hidden');
						 $("#visAll").removeClass('hidden');
						$("#brandButton").text('Fetch Latest Data');
						$('#brandButton').prop('disabled', false);
						
						var ingredientsData = xhr_data;
						
						(function ingredientsVisualization() {
						// dc js chart objects	
						var ingredientsCount = dc.dataCount('.dc-data-count');
							
						var stackrowChart1 = dc.rowChart('#stackrowChart1');
						
						var stackrowChart2 = dc.rowChart('#stackrowChart2');
						
						var stackbarChart1 = dc.barChart('#stackbarChart1');
						
						var stackbarChart2 = dc.barChart('#stackbarChart2');

						var sliceChart1 = dc.bubbleChart('#sliceChart1');
						
						var sliceChart2 = dc.dataTable('#sliceChart2');
						
						var sliceChart3 = dc.barChart('#sliceChart3')
						
						// the data for the analysis
						var dataforViz = ingredientsData.data;
						
						var numberFormat1 = d3.format(".3f");
						
						var numberFormat2 = d3.format(",.0f");
						
						dataforViz.forEach(function(d) { 
						d.flavor = d["flavor"];
						d.carbsperunitserving = parseFloat(d["carbsperunitserving"]);
						d.calperunitserving = parseFloat(d["calperunitserving"]);
						d.vitamincperunitserving = parseFloat(d["vitamincperunitserving"]);
						d.item_name = d["item_name"];
						d.itemId = d["item_id"];
						d.total_carbohydrate = parseInt(d["total_carbohydrate"]);
						d.calories = parseInt(d["calories"]);
						d.serving_size_unit = d["serving_size_unit"];
						d.serving_size_qty = parseInt(d["serving_size_qty"]);
						d.ingredient_statement = d["ingredient_statement"];
						d.vitamin_c_dv = parseInt(d["vitamin_c_dv"]);
						d.updated_at = d["updated_at"];
						d.ingredient = d["main-ingredient"];
						});	
						
						// cross filter object
						var crossDataforviz = crossfilter(dataforViz);
						var all = crossDataforviz.groupAll();
						
						// cross filter dimensions
						var ingredientDim = crossDataforviz.dimension(function (d) {return d.ingredient;});
						var flavorDim = crossDataforviz.dimension(function (d) {return d.flavor;});
						var serving_size_unitDim = crossDataforviz.dimension(function (d) {return d.serving_size_unit;});
						var caloriesDim = crossDataforviz.dimension(function (d) {return d.calories;});
						var total_carbohydrateDim = crossDataforviz.dimension(function (d) {return d.total_carbohydrate;});
						var item_nameDim = crossDataforviz.dimension(function (d) {return d.item_name;});
						var vitamin_c_dvDim = crossDataforviz.dimension(function (d) {return d.vitamin_c_dv;});
						
						var flavorScale = d3.scale.ordinal().domain(["Berries", "Melon","Grape","Orange","Peach","Mango","Apple","Pine Apple","Cherry","Other"])
															.range(["#d53032","#4d9e36","#6f2da8","#ffa500","#ffdab9","#FF8040","#a40000","#ffec89","#6c132b","#4682b4"]);

						// the min max values for all
						
						var minuscalories = caloriesDim.bottom(1)[0].calories;
						var maxuscalories = caloriesDim.top(1)[0].calories;
						
						var minustotal_carbohydrate = total_carbohydrateDim.bottom(1)[0].total_carbohydrate;
						var maxustotal_carbohydrate = total_carbohydrateDim.top(1)[0].total_carbohydrate;
						
						var minusvitamin_c_dv = vitamin_c_dvDim.bottom(1)[0].vitamin_c_dv;
						var maxusvitamin_c_dv = vitamin_c_dvDim.top(1)[0].vitamin_c_dv;
						
						// cross filter groups
						
						var ingredientGroup = ingredientDim.group().reduce(
											function (p, v) {
											++p.count;
											p.carbsperunitservingSum += v.carbsperunitserving;
											p.calperunitservingSum += v.calperunitserving;
											p.vitamincperunitservingSum += v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum += v.total_carbohydrate;
											p.caloriesSum += v.calories;
											p.vitamin_c_dvSum += v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;},
											function (p, v) {
											--p.count;
											p.carbsperunitservingSum -= v.carbsperunitserving;
											p.calperunitservingSum -= v.calperunitserving;
											p.vitamincperunitservingSum -= v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum -= v.total_carbohydrate;
											p.caloriesSum -= v.calories;
											p.vitamin_c_dvSum -= v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;
											},
											function () {
											return {count: 0,carbsperunitservingSum: 0,
													calperunitservingSum: 0, 
													vitamincperunitservingSum: 0, 
													avgcarbsperunitserving: 0,
													avgcalperunitserving: 0,
													avgvitamincperunitserving: 0,
													total_carbohydrateSum: 0,
													caloriesSum: 0,
													vitamin_c_dvSum: 0,
													avgcarbs: 0,
													avgcal: 0,
													avgvitaminc: 0}});
						
						var flavorGroup = flavorDim.group().reduce(
											function (p, v) {
											++p.count;
											p.carbsperunitservingSum += v.carbsperunitserving;
											p.calperunitservingSum += v.calperunitserving;
											p.vitamincperunitservingSum += v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum += v.total_carbohydrate;
											p.caloriesSum += v.calories;
											p.vitamin_c_dvSum += v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;},
											function (p, v) {
											--p.count;
											p.carbsperunitservingSum -= v.carbsperunitserving;
											p.calperunitservingSum -= v.calperunitserving;
											p.vitamincperunitservingSum -= v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum -= v.total_carbohydrate;
											p.caloriesSum -= v.calories;
											p.vitamin_c_dvSum -= v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;
											},
											function () {
											return {count: 0,carbsperunitservingSum: 0,
													calperunitservingSum: 0, 
													vitamincperunitservingSum: 0, 
													avgcarbsperunitserving: 0,
													avgcalperunitserving: 0,
													avgvitamincperunitserving: 0,
													total_carbohydrateSum: 0,
													caloriesSum: 0,
													vitamin_c_dvSum: 0,
													avgcarbs: 0,
													avgcal: 0,
													avgvitaminc: 0}});
											
						var serving_size_unitGroup = serving_size_unitDim.group().reduce(
											function (p, v) {
											++p.count;
											p.carbsperunitservingSum += v.carbsperunitserving;
											p.calperunitservingSum += v.calperunitserving;
											p.vitamincperunitservingSum += v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum += v.total_carbohydrate;
											p.caloriesSum += v.calories;
											p.vitamin_c_dvSum += v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;},
											function (p, v) {
											--p.count;
											p.carbsperunitservingSum -= v.carbsperunitserving;
											p.calperunitservingSum -= v.calperunitserving;
											p.vitamincperunitservingSum -= v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum -= v.total_carbohydrate;
											p.caloriesSum -= v.calories;
											p.vitamin_c_dvSum -= v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;
											},
											function () {
											return {count: 0,carbsperunitservingSum: 0,
													calperunitservingSum: 0, 
													vitamincperunitservingSum: 0, 
													avgcarbsperunitserving: 0,
													avgcalperunitserving: 0,
													avgvitamincperunitserving: 0,
													total_carbohydrateSum: 0,
													caloriesSum: 0,
													vitamin_c_dvSum: 0,
													avgcarbs: 0,
													avgcal: 0,
													avgvitaminc: 0}});

						var caloriesGroup = caloriesDim.group().reduce(
											function (p, v) {
											++p.count;
											p.carbsperunitservingSum += v.carbsperunitserving;
											p.calperunitservingSum += v.calperunitserving;
											p.vitamincperunitservingSum += v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum += v.total_carbohydrate;
											p.caloriesSum += v.calories;
											p.vitamin_c_dvSum += v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;},
											function (p, v) {
											--p.count;
											p.carbsperunitservingSum -= v.carbsperunitserving;
											p.calperunitservingSum -= v.calperunitserving;
											p.vitamincperunitservingSum -= v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum -= v.total_carbohydrate;
											p.caloriesSum -= v.calories;
											p.vitamin_c_dvSum -= v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;
											},
											function () {
											return {count: 0,carbsperunitservingSum: 0,
													calperunitservingSum: 0, 
													vitamincperunitservingSum: 0, 
													avgcarbsperunitserving: 0,
													avgcalperunitserving: 0,
													avgvitamincperunitserving: 0,
													total_carbohydrateSum: 0,
													caloriesSum: 0,
													vitamin_c_dvSum: 0,
													avgcarbs: 0,
													avgcal: 0,
													avgvitaminc: 0}});
											
						var total_carbohydrateGroup = total_carbohydrateDim.group().reduce(
											function (p, v) {
											++p.count;
											p.carbsperunitservingSum += v.carbsperunitserving;
											p.calperunitservingSum += v.calperunitserving;
											p.vitamincperunitservingSum += v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum += v.total_carbohydrate;
											p.caloriesSum += v.calories;
											p.vitamin_c_dvSum += v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;},
											function (p, v) {
											--p.count;
											p.carbsperunitservingSum -= v.carbsperunitserving;
											p.calperunitservingSum -= v.calperunitserving;
											p.vitamincperunitservingSum -= v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum -= v.total_carbohydrate;
											p.caloriesSum -= v.calories;
											p.vitamin_c_dvSum -= v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;
											},
											function () {
											return {count: 0,carbsperunitservingSum: 0,
													calperunitservingSum: 0, 
													vitamincperunitservingSum: 0, 
													avgcarbsperunitserving: 0,
													avgcalperunitserving: 0,
													avgvitamincperunitserving: 0,
													total_carbohydrateSum: 0,
													caloriesSum: 0,
													vitamin_c_dvSum: 0,
													avgcarbs: 0,
													avgcal: 0,
													avgvitaminc: 0}});
											
						var item_nameGroup = item_nameDim.group().reduce(
											function (p, v) {
											++p.count;
											p.carbsperunitservingSum += v.carbsperunitserving;
											p.calperunitservingSum += v.calperunitserving;
											p.vitamincperunitservingSum += v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum += v.total_carbohydrate;
											p.caloriesSum += v.calories;
											p.vitamin_c_dvSum += v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;},
											function (p, v) {
											--p.count;
											p.carbsperunitservingSum -= v.carbsperunitserving;
											p.calperunitservingSum -= v.calperunitserving;
											p.vitamincperunitservingSum -= v.vitamincperunitserving;
											p.avgcarbsperunitserving = p.count ? p.carbsperunitservingSum / p.count : 0;
											p.avgcalperunitserving = p.count ? p.calperunitservingSum / p.count : 0;
											p.avgvitamincperunitserving = p.count ? p.vitamincperunitservingSum / p.count : 0;
											p.total_carbohydrateSum -= v.total_carbohydrate;
											p.caloriesSum -= v.calories;
											p.vitamin_c_dvSum -= v.vitamin_c_dv;
											p.avgcarbs = p.count ? p.total_carbohydrateSum / p.count : 0;
											p.avgcal = p.count ? p.caloriesSum / p.count : 0;
											p.avgvitaminc = p.count ? p.vitamin_c_dvSum / p.count : 0;
											return p;
											},
											function () {
											return {count: 0,carbsperunitservingSum: 0,
													calperunitservingSum: 0, 
													vitamincperunitservingSum: 0, 
													avgcarbsperunitserving: 0,
													avgcalperunitserving: 0,
													avgvitamincperunitserving: 0,
													total_carbohydrateSum: 0,
													caloriesSum: 0,
													vitamin_c_dvSum: 0,
													avgcarbs: 0,
													avgcal: 0,
													avgvitaminc: 0}});

								console.log(item_nameGroup.all());
								// defining the dc js charts
								stackrowChart1
											.width(220)
											.height(300)
											.margins({top: 20, left: 20, right: 20, bottom: 20})
											.group(flavorGroup)
											.dimension(flavorDim)
											.valueAccessor(function (d) {return d.value.avgcalperunitserving;})
											.colors(function(d){ return flavorScale(d); })
											.label(function (d) {
												return d.key;})
											.title(function (d) {
												return d.key + "\n" + "Average Calorie Per Unit Serving:" + "\n" + numberFormat1(d.value.avgcalperunitserving);
											})
											.elasticX(true)
											.xAxis().ticks(4);
											
								stackrowChart2
											.width(220)
											.height(300)
											.margins({top: 20, left: 20, right: 20, bottom: 20})
											.group(serving_size_unitGroup)
											.dimension(serving_size_unitDim)
											.valueAccessor(function (d) {return d.value.avgcalperunitserving;})
											.label(function (d) {
												return d.key;})
											.title(function (d) {
												return d.key + "\n" + "Average Calorie Per Unit Serving:" + "\n" + numberFormat1(d.value.avgcalperunitserving);
											})
											.elasticX(true)
											.xAxis().ticks(4);
								
								  
  
							  
								stackbarChart1.width(400)
											.height(150)
											.margins({top: 20, left: 20, right: 20, bottom: 20})
											.dimension(caloriesDim)
											.group(caloriesGroup)
											.valueAccessor(function (d) {return d.value.avgcalperunitserving;})
											.title(function (d) {
												return d.key + "\n" + "Average Calorie Per Unit Serving:" + "\n" + numberFormat1(d.value.avgcalperunitserving);
											})
											.transitionDuration(500)
											.centerBar(true)	
											.x(d3.scale.linear())
											.elasticX(true)
											.elasticY(true)
									stackbarChart1.xAxis().tickFormat(d3.format(",.2f"))
									stackbarChart1.xUnits(function(){return 50;});
								
								stackbarChart2.width(400)
											.height(150)
											.margins({top: 20, left: 20, right: 20, bottom: 20})
											.dimension(total_carbohydrateDim)
											.group(total_carbohydrateGroup)
											.valueAccessor(function (d) {return d.value.avgcalperunitserving;})
											.title(function (d) {
												return d.key + "\n" + "Average Calorie Per Unit Serving:" + "\n" + numberFormat1(d.value.avgcalperunitserving);
											})
											.transitionDuration(500)
											.centerBar(true)	
											.x(d3.scale.linear())
											.elasticX(true)
											.elasticY(true)
										stackbarChart2.xAxis().tickFormat(d3.format(",.2f"))
										stackbarChart2.xUnits(function(){return 50;});
								
								
								sliceChart3
										.width(1200)
										.height(400)
										.margins({top: 15, left: 30, right: 15, bottom: 100})
										.x(d3.scale.ordinal())
										.xUnits(dc.units.ordinal)
										.brushOn(true)
										.elasticY(true)
										.yAxisLabel('Number of unique Nutritionix ItemIDs')
										.dimension(ingredientDim)
										.barPadding(0.5)
										.outerPadding(0.5)
										.group(ingredientGroup)
										.valueAccessor(function (d) {return d.value.count;})
										.title(function (d) {
												return d.key + "\n" + "Number of unique Nutritionix ItemIDs:" + "\n" + numberFormat2(d.value.count);
											})
										.renderlet(function (chart) {chart.selectAll('g.x text').attr('transform', 'translate(-1,1) rotate(300)')});
								sliceChart3.yAxis().tickFormat(d3.format(",.0f")).ticks(10)
								
								
								
								
								
								
								
								
								
								sliceChart1 
											.width(1200)
											.height(500)
											.margins({top: 15, left: 30, right: 15, bottom: 30})
											.dimension(item_nameDim)
											.group(item_nameGroup)
											.keyAccessor(function (p) {return p.value.avgcarbsperunitserving;})
											.valueAccessor(function (p) {return p.value.avgcalperunitserving;})
											.radiusValueAccessor(function (p) {return p.value.avgvitamincperunitserving;})
											.x(d3.scale.linear())
											.y(d3.scale.linear())
											.r(d3.scale.linear().domain([0, 120]))
											.elasticY(true)
											.elasticX(true)
											.yAxisPadding(10)
											.xAxisPadding(10)
											.maxBubbleRelativeSize(0.01)
											.renderHorizontalGridLines(true)
											.renderVerticalGridLines(true)
											.xAxisLabel('Avg Total Carbs Per Unit Serving(grams)')
											.yAxisLabel('Avg Calorie Per Unit Serving')
											.renderTitle(true)
											.renderLabel(false)
											.title(function (p) {return ['Product: ' + p.key,
														'Avg Total Carbs(grams) Per Unit Serving : ' + numberFormat1(p.value.avgcarbsperunitserving) + ' grams',
														'Avg Calorie Per Unit Serving: ' + numberFormat1(p.value.avgcalperunitserving) + ' calories',
														'Avg Vitamin C % Daily Value Per Unit Serving : ' + numberFormat1(p.value.avgvitamincperunitserving) + ' %',
														'Total Carbs(grams): ' + numberFormat2(p.value.total_carbohydrateSum) + ' grams',
														'Calories: ' + numberFormat2(p.value.caloriesSum) + ' calories',
														'Vitamin C % Daily Value: ' + numberFormat2(p.value.vitamin_c_dvSum) + ' %'].join('\n');})
									sliceChart1.yAxis().tickFormat(d3.format(",.2f")).ticks(10)
									sliceChart1.xAxis().tickFormat(d3.format(",.2f")).ticks(10)

								sliceChart2
											.dimension(ingredientDim)
											.group(function(d) { return ""})
											.size(15)
											.columns([
											function(d) { return  d.ingredient; },
											function(d) { return  d.itemId; },
											function(d) { return  d.item_name; },
											function(d) { return  d.serving_size_qty; },
											function(d) { return  d.serving_size_unit; },
											function(d) { return  d.ingredient_statement; },
											function(d) { return  d.total_carbohydrate; },
											function(d) { return  d.calories; },
											function(d) { return  d.vitamin_c_dv; },
											function(d) { return  d.updated_at; }
											
											])
											.sortBy(function(d){ return d.calories; })
											.order(d3.ascending);
											
											
								ingredientsCount 
											.dimension(crossDataforviz)
											.group(all)
											.html({
												some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
													' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
												all: 'All records selected. Please click on the graph to apply filters.'
											});

											
								dc.renderAll();
						
							
							
							
							
						}());
						

						
							
						}	
						
						
					},
					error:function(error){
					$("#datapullAlert").removeClass('hidden');	
					$("#brandButton").text('Fetch Latest Data');
					$('#brandButton').prop('disabled', false);
					$("#ajaxLoader").addClass('hidden');
					// if error show an alert		
					}
					

})
	
}())




	
},

error:function(error){
concole.log(error);	
$("#datapullAlert").removeClass('hidden');	
$("#brandButton").text('Fetch Latest Data');
$('#brandButton').prop('disabled', false);
$("#ajaxLoader").addClass('hidden');
// if error show an alert		
}




			

});			
			
			
});			
			
					
					
});		
