pc.script.create('steer', function (context) {
    var temp = new pc.Vec3();
    
    // Creates a new Steer instance
    var Steer = function (entity) {
        this.entity = entity;
        this.velocity = new pc.Vec3();
        this.modelEntity = null;
        this.initialEulerAngles = null;
        this.velocityCalculator = null
    };

    Steer.prototype = {
        initialize: function () {
            this.modelEntity = this.entity.findByName('model');
            this.initialEulerAngles = this.modelEntity.getLocalEulerAngles();    
        },
        
        setVelocity: function (vel) {
            this.velocity.copy(vel);  
            this.entity.rigidbody.linearVelocity = this.velocity;
            
            var len = this.velocity.length();
            
            if (len === 0) {
                this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;
            } else {
                temp.copy(this.velocity).scale(1 / len);
                var forward = this.entity.forward;
                var dot = temp.dot(forward);
                var sign = temp.cross(temp, forward).y > 0 ? 1 : -1;
                temp.copy(this.entity.up).scale(sign * (dot - 1) * 10);
                this.entity.rigidbody.angularVelocity = temp;    
            }
        },
        
        update: function (dt) {
            var currentVelocity = this.entity.rigidbody.linearVelocity;
            var angles = this.modelEntity.getLocalEulerAngles();
            if (currentVelocity.length() > 0) {
                angles.x = pc.math.lerp(angles.x, -10, dt*10);
            } else {
                angles.x = pc.math.lerp(angles.x, 0, dt*10);
            }
            
            this.modelEntity.setLocalEulerAngles(angles);
            
            if (this.velocityCalculator) {
                var velocity = this.velocityCalculator.calculateVelocity.call(this.velocityCalculator, dt);
                this.setVelocity(velocity);
            } else {
                this.setVelocity(pc.Vec3.ZERO);
            }
        }
    };

    return Steer;
});