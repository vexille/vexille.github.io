define([
    'parse'],
        function (Parse) {
            // pt_BR : portuguese text
            // en_US : english text
            var Text = Parse.Object.extend("Text");
            return Text;
        });