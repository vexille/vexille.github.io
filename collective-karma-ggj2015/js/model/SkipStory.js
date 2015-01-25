define([
    'parse'],
        function (Parse) {
            // decisionTaken : pointer to the decision made to skip a story
            // skip : pointer to the story to skip
            // goToStory : pointer to the story we should go to
            var SkipStory = Parse.Object.extend("SkipStory");
            return SkipStory;
        });