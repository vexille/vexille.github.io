define([
    'parse'],
        function (Parse) {
            // text : pointer to text object
            // goToStory : pointer to the story this decision should open
            var Decision = Parse.Object.extend("Decision");
            return Decision;
        });