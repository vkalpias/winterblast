pc.script.create('explosion', function (context) {
    // Creates a new Explosion instance
    var Explosion = function (entity) {
        this.entity = entity;
    };

    Explosion.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return Explosion;
});