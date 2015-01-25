define([
    'jquery', 
    'lodash', 
    'parse', 
    'views/content/decision'],
        function ($, _, Parse, DecisionView) {

            var DecisionListView = Parse.View.extend({
                tagName: "table",
                className: "decisionList",
                
                initialize: function (decisions, storyId, theater) {
                    this.decisions = decisions;
                    this.theater = theater;
                    this.views = [];
                    this.storyId = storyId;
                },
                
                render: function () {
                    for (var i = 0; i < this.decisions.length; i++) {
                        var view = new DecisionView(this.decisions[i]);
                        this.views.push(view);
                        this.$el.append(view.render());
                    }
                    
                    this.$el.append($("<tr><td></td><td><div id='globalKarma-" + this.storyId + "' class='globalKarma'></div></td></tr>"));
                    //this.$el.append($("<div id='globalKarma-" + this.storyId + "'></div>").addClass("globalKarma"));
                    
                    return this.el;
                },
                
                setupTheater: function() {
                    for (var i = 0; i < this.views.length; i++) {
                        this.views[i].setupTheater(this.theater);
                    }
                },
                
                setupStatisticsTheater: function(theater) {
                    theater.describe("karma", { speed:  .4, accuracy:  1, invincibility: 1 }, "#globalKarma-" + this.storyId);
                    theater.write("karma: COLLECTIVE KARMA");
                    
                    var statTotal = 0;
                    for (var i = 0; i < this.views.length; i++) {
                        statTotal += this.views[i].statCount();
                    }
                    
                    statTotal++;
                    
                    for (var i = 0; i < this.views.length; i++) {
                        this.views[i].setupStatisticsTheater(theater, statTotal);
                    }
                },
                
                addEventOptions: function() {
                    for (var i = 0; i < this.views.length; i++) {
                        this.views[i].addEventOption();
                    }
                },
                
                removeEventOptions: function() {
                    for (var i = 0; i < this.views.length; i++) {
                        this.views[i].removeEventOption();
                    }
                },
                
                viewCount: function() {
                    return this.views.length;
                }
            });
            
            return DecisionListView;

        });