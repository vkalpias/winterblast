var Timer = function (rate, startImmediately) {
    this.rate = rate;
    this.startImmediately = startImmediately;
    this.reset();
    pc.events.attach(this);
}

Timer.prototype = {
    tick: function (dt) {
        this.time -= dt;
        if (this.time <= 0) {
            this.fire('finish');
            this.time = this.rate;
        } else if (Math.floor(this.time) !== this.lastTime) {
            this.lastTime = Math.floor(this.time);
            this.fire('second', this.lastTime);
        }
    },
    
    reset: function () {
        this.time = this.startImmediately ? 0 : this.rate;
        this.lastTime = Math.floor(this.time);
    }
}