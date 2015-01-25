define([
    'jquery', 
    'lodash', 
    'parse', 
    'text!template/content/story.html',
    'model/Text'],
        function ($, _, Parse, templateText, TextModel) {

            var StoryView = Parse.View.extend({
                template: _.template(templateText),
                tagName: "div",
                
                initialize: function (story, theater) {
                    var locale = Parse.Config.current().get("currentLocale"),
                        id = story.model.id;
                    var text = story.text.get(locale);
                    
                    while (text.indexOf("\n") >= 0) {
                        text = text.replace("\n", "<br />");
                    }
                    this.storyText = text;
                    this.storyId = id;
                    this.theater = theater;
                    
                    this.$el.attr("id", "Narration-" + this.storyId);
                },
                
                render: function () {
                    this.$el.html(this.template({
                        storyId: this.storyId,
                        text: this.storyText
                    }));
                    
                    return this.el;
                },
                
                setupTheater: function() {
                    var narrationActor = "Narration-" + this.storyId,
                        narrationActorStats = Parse.Config.current().get("narrationActor"),
                        narrationElementId = "#" + narrationActor;
                
                    this.theater.describe(narrationActor, narrationActorStats, narrationElementId);
                    this.theater.write(narrationActor + ": " + this.storyText);
                }

            });
            return StoryView;

        });