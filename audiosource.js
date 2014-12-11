pc.script.create('audiosource', function (context) {
    // Creates a new Audiosource instance
    var Audiosource = function (entity) {
        this.entity = entity;
    };

    Audiosource.prototype = {
        // Called once after all resources are loaded and before the first update
        onEnable: function () {
            if (game.audio) {
                game.audio.registerSource(this.entity.audiosource);    
            } else {
                setTimeout(this.onEnable.bind(this), 25); // hack
            }
        },
        
        onDisable: function () {
            game.audio.unregisterSource(this.entity.audiosource);
        }
    };

    return Audiosource;
});