define([
    'jquery', 
    'lodash', 
    'parse', 
    'text!template/content/base.html',
    'views/content/storyLoader',
    'model/StoryStart'],
        function ($, _, Parse, templateText, StoryLoaderView, StoryStartModel) {

            var BaseContentView = Parse.View.extend({
                template: _.template(templateText),
                initialize: function () {
                    var firstNodeQuery1 = new Parse.Query(StoryStartModel);
                    var firstNodeQuery2 = new Parse.Query(StoryStartModel);
                    var that = this;
                    firstNodeQuery1.count().then(function (count) {
                        var skip = Math.floor(Math.random() * count);
                        firstNodeQuery2.skip(skip);
                        firstNodeQuery2.limit(1);
                        firstNodeQuery2.find().then(function (elements) {
                            for (var i= 0, len = elements.length; i < len; i++) {
                                that.currentStory = new StoryLoaderView(elements[i].get("story"));
                                that.render();
                            }
                        });
                    });
                },
                render: function () {
                    this.$el.html(this.template());
                    if (this.currentStory != null) {
                        this.$el.append(this.currentStory.render());
                    }
                    return this.el;
                },

            });
            return BaseContentView;

        });