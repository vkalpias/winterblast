pc.script.create('limits', function (context) {
    // Creates a new Limits instance
    var Limits = function (entity) {
        this.entity = entity;
    };

    Limits.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.entity.getChildren().forEach(function (child) {
               child.rigidbody.mask = 128; // only collide with the player 
            });
        }
    };

    return Limits;
});