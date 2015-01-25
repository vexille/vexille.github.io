define([
    'parse'],
        function (Parse) {
            // text : pointer to text object
            // decisions : relation to decision object
            var Story = Parse.Object.extend("Story");
            return Story;
        });