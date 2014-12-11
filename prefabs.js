pc.script.create('prefabs', function (context) {
    // Creates a new Prefabs instance
    var Prefabs = function (entity) {
        this.entity = entity;
        this.prefabs = {};
        this.pools = {};
        this.spawned = [];
    };

    Prefabs.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            game.on('reset', this.reset, this);
        },
        
        reset: function () {
            
            this.spawned.forEach(function (e) {
                e.destroy();
            });
            this.spawned = [];
            this.pools = {};
        },
        
        add: function (entity) {
            this.prefabs[entity.getName()] = entity;
        },
        
        get: function (name) {
            if (!this.prefabs[name]) {
                throw('Cannot find prefab ' + name);
            }
            
            return this.prefabs[name];
        },
        
        isPrefab: function (entity) {
            return this.prefabs[entity.getName()] === entity;
        },
        
        spawn: function (name, parent) {
            if (!this.pools[name]) {
                this.pools[name] = [];
            }
            
            var pool = this.pools[name];
            
            var clone = null;
            
            if (pool.length) {
                clone = pool.pop();
            } else {
                clone = this.get(name).clone();
                this.spawned.push(clone);
            }
            
            clone.enabled = true;
            
            if (parent) {
                parent.addChild(clone);
            }
            
            return clone;
        },
        
        destroy: function (entity) {
            var pool = this.pools[entity.getName()];
            
            // sanity check
            if (!pool || pool.indexOf(entity) >= 0) {
                return;
            }
            
            pool.push(entity);
            
            if (entity.rigidbody) {
                entity.rigidbody.linearVelocity = pc.Vec3.ZERO;    
            }
            
            var parent = entity.getParent();
            if (parent) {
                parent.removeChild(entity);
            }
            
          
            entity.enabled = false;
        }
        
    };

    return Prefabs;
});