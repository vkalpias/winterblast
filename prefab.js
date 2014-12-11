pc.script.create('prefab', function (context) {
    // Creates a new Prefab instance
    var Prefab = function (entity) {
        this.entity = entity;
    };

    Prefab.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            var scripts = this.entity.script.scripts.filter(function (script) {
                return script.name !== 'prefab';
            });
            
            this.entity.script.scripts = scripts;
            
            game.prefabs.add(this.entity);
            
            this.entity.enabled = false;
        }
    };

    return Prefab;
});