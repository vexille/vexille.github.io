define([
    'jquery', 
    'lodash', 
    'parse', 
    'text!template/content/decision.html',
    'model/Text'],
        function ($, _, Parse, templateText, TextModel) {

            var DecisionView = Parse.View.extend({
                template: _.template(templateText),
                tagName: "tr",
                className: "option",
                
                initialize: function (decision) {
                    var locale = Parse.Config.current().get("currentLocale");
                    var text = decision.text.get(locale);
                    
                    while (text.indexOf("\n") >= 0) {
                        text = text.replace("\n", "<br />");
                    }
                    
                    this.decisionIndex = decision.index;
                    this.decisionText = text;
                    this.decisionId = decision.model.id;
                    this.narrationId = "option-" + decision.model.id;
                    this.decisionCount = decision.model.get("count");
                    if (this.decisionCount === undefined) {
                        this.decisionCount = 0;
                    }
                    //this.$el.attr("id", "option-" + decision.model.id);
                    this.$el.attr("data-decision-id", decision.model.id);
                    this.$el.attr("data-go-to-story-id", decision.model.get("goToStory").id);
                },
                
                render: function () {
                    this.$el.html(this.template({
                        index: this.decisionId,
                        count: this.decisionCount
                    }));
                    
                    return this.el;
                },
                
                setupTheater: function(theater) {
                    var narrationActor = this.narrationId,
                        narrationActorStats = Parse.Config.current().get("decisionActor"),
                        narrationElementId = "#" + narrationActor;
                
                    theater.describe(narrationActor, narrationActorStats, narrationElementId);
                    theater.write(narrationActor + ": [" + (this.decisionIndex + 1) + "] " + this.decisionText);
                },
                
                addEventOption: function() {
                    this.$el.addClass("selectable");
                },
                
                removeEventOption: function() {
                    this.$el.removeClass("selectable");
                },
                
                setupStatisticsTheater: function(theater, total) {
                    var emptyChar = "─",
                        filledChar = "█",
                        totalChars = 18;
                    
                    var $statsLi = $("#statistics-" + this.decisionId);
                    var count = $statsLi.data("count");
                    
                    if (this.$el.hasClass("selected")) {
                        count++;
                    }
                    
                    var perc = count / total;
                    var roundedPerc = parseFloat(Math.round((perc * 100) * 100) / 100).toFixed(2);
                    
                    $statsLi.html("");
                    
                    var filledChars = Math.round(totalChars * perc),
                        emptyChars = totalChars - filledChars;
                
                    var text = "";
                    for (var i = 0; i < filledChars; i++) {
                        text += filledChar;
                    }
                    for (var i = 0; i < emptyChars; i++) {
                        text += emptyChar;
                    }
                    
                    text += " " + roundedPerc + "%";
                    
                    theater.describe("stats-"+this.decisionId, Parse.Config.current().get("statisticActor"), "#statistics-"+this.decisionId);
                    theater.write("stats-"+this.decisionId+": "+text);
               },
               
               statCount: function() {
                   return $("#statistics-" + this.decisionId).data("count");
               }
            });
            
            return DecisionView;

        });