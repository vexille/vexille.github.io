define([
    'jquery',
    'lodash',
    'parse',
    'theater',
    'text!template/content/storyLoader.html',
    'views/content/story',
    'views/content/decisionList',
    'model/Story',
    'model/SkipStory',
    'model/Decision',
    'model/Text'],
        function ($, _, Parse, TheaterLibJS, templateText, StoryView, DecisionListView, StoryModel, SkipStoryModel, DecisionModel, TextModel) {

            var StoryLoaderView = Parse.View.extend({
                template: _.template(templateText),
                
                events: {
                    "click .selectable": "onDecision",
                },
                
                initialize: function (story) {
                    this.firstNode = story.id;
                    this.promptTimer = null;
                    this.$prompt = $("#prompt");
                    this.theater = new TheaterJS({ erase: false, autoplay: false, locale: "detect"});
                    this.storyNodes = [];
                    this.skipStoryNodes = [];
                    this.decisionNodes = [];
                    this.textNodes = [];
                    this.resetDecisions();
                    
                    var self = this,
                        storyQuery = new Parse.Query(StoryModel),
                        skipSQuery = new Parse.Query(SkipStoryModel),
                        decisionQuery = new Parse.Query(DecisionModel),
                        textQuery = new Parse.Query(TextModel);
                    
                    var fetchCount = 0;
                    
                    storyQuery.limit(1000);
                    storyQuery.find().then(function(result)     { onFetchComplete(result, self.storyNodes); });
                    skipSQuery.limit(1000);
                    skipSQuery.find().then(function(result)     { onFetchComplete(result, self.skipStoryNodes); });
                    decisionQuery.limit(1000);
                    decisionQuery.find().then(function(result)  { onFetchComplete(result, self.decisionNodes); });
                    textQuery.limit(1000);
                    textQuery.find().then(function(result)      { onFetchComplete(result, self.textNodes); });
                    
                    var onFetchComplete = function(result, nodeList) {
                        for (var i = 0; i < result.length; i++) {
                            nodeList[result[i].id] = result[i];
                        }
                        
                        fetchCount++;
                        if (fetchCount === 4) {
                            self.loadStory(story.id);
                        }
                    }
                    
                    this.theater
                        .on("say:start, erase:start", function (eventName) {
                            var self    = this,
                                current = self.current.voice;

                            self.utils.addClass(current, "saying");
                        })
                        .on("say:end, erase:end", function (eventName) {
                            var self    = this,
                                current = self.current.voice;

                            self.utils.removeClass(current, "saying");
                        });
                },
                
                render: function () {
                    this.$el.html(this.template());
                    return this.el;
                },
                
                loadStory: function (storyId) {
                    this.checkStoryReset(storyId);
                    var realStoryId = this.getStoryIdAfterSkip(storyId);
                    this.currentStoryId = realStoryId;
                    
                    var story = this.storyNodes[realStoryId],
                        text = this.textNodes[story.get("text").id];
                
                    this.currentStoryView = new StoryView({model: story, text: text}, this.theater);
                    this.loadDecisions(story.relation("decisions"));
                    
                    this.activateScroll();
                    
                    if (this.promptTimer !== null) {
                        clearInterval(this.promptTimer);
                        this.promptTimer = null;
                        this.$prompt.removeClass("activePrompt");
                    }
                },
                
                checkStoryReset: function(storyId) {
                    if (this.firstNode === storyId) {
                        this.resetDecisions();
                        this.render();
                    }
                },
                
                resetDecisions: function() {
                    this.decisionHistory = [];
                    this.decisionCache = [];
                    this.decisionCount = [];
                },
                
                getStoryIdAfterSkip: function(storyId) {
                    var realStoryId = storyId;
                    var skipStoryKey;
                    for (skipStoryKey in this.skipStoryNodes) {
                        var skipStory = this.skipStoryNodes[skipStoryKey];
                        if (skipStory.get("skip").id === storyId) {
                            var decisionTakenKey;
                            for (decisionTakenKey in this.decisionHistory) {
                                var decisionTaken = this.decisionHistory[decisionTakenKey];
                                if (decisionTaken === skipStory.get("decisionTaken").id) {
                                    realStoryId = skipStory.get("goToStory").id;
                                }
                            }
                        }
                    }
                    return realStoryId;
                },
                
                update: function() {
                    if (this.currentStoryView !== null) {
                        var self = this;
                        this.$el.append(this.currentStoryView.render());
                        this.$el.append(this.currentDecisions.render());
                        
                        this.currentStoryView.setupTheater();
                        this.currentDecisions.setupTheater();
                        
                        this.theater.write(function() {
                            self.currentDecisions.addEventOptions();
                            self.promptTimer = setInterval(function() {
                                self.$prompt.toggleClass("activePrompt"); 
                                self.deactivateScroll();
                            }, 400);
                        });
                        
                        this.theater.play();
                    }
                },
                
                loadDecisions: function (relation) {
                    var decisions = [],
                        self = this;
                
                    relation.query().find().then(function(resultDecisions) {
                        self.decisionCache = resultDecisions;
                        if (resultDecisions.length > 0) {
                            for (var i = 0; i < resultDecisions.length; i++) {
                                var decision = resultDecisions[i];
                                decisions.push({
                                    model: self.decisionNodes[decision.id],
                                    text: self.textNodes[decision.get("text").id],
                                    index: i
                                })
                            }
                        } else {
                            console.log("DO STATISTICS");
                        }

                        self.currentDecisions = new DecisionListView(decisions, self.currentStoryId, self.theater); 
                        self.update();
                    });
                },
                
                onDecision: function (event) {
                    this.$decisionElement = $(event.currentTarget);
                    this.$decisionElement.addClass("selected");
                    
                    this.removeEventOptions();
                    var decisionId = this.$decisionElement.data("decision-id");
                    this.saveDecision(this.currentStoryId, decisionId);
                    
                    if (this.currentStoryId !== this.firstNode
                            && this.currentDecisions.viewCount() > 1) {
                        var self = this;
                        var newTheater = new TheaterJS();
                        this.currentDecisions.setupStatisticsTheater(newTheater);
                        newTheater.write(function() { 
                            setTimeout(function() {
                               self.onStatisticEnd(self.$decisionElement);
                            }, 500);
                        });
                        newTheater.play();
                    } else {
                        this.onStatisticEnd(this.$decisionElement);
                    }
//                    var $element = $(event.currentTarget);
//                    var decisionId = $element.data("decision-id");
//                    this.removeEventOptions();
//                    this.saveDecision(this.currentStoryId, decisionId);
//                    this.loadStory($element.data("go-to-story-id"));
//                    
//                    $element.addClass("selected");
                },
                
                onStatisticEnd: function($element) {
                    this.loadStory($element.data("go-to-story-id"));
                },
                
                saveDecision: function(storyId, decisionId) {
                    Parse.Cloud.run("incrementDecision", { decisionId: decisionId });
                    this.decisionNodes[decisionId];
                    this.decisionHistory[storyId] = decisionId;
                },
                
                removeEventOptions: function() {
                    this.currentDecisions.removeEventOptions();
                },
                
                activateScroll: function() {
                    this.scrollTimer = setInterval(this.scrollFn, 1);
                },
                
                deactivateScroll: function() {
                    clearTimeout(this.scrollTimer);
                },
                
                scrollFn: function() {
                    $("html, body").scrollTop($(document).height());
                }
            });
            return StoryLoaderView;

        });