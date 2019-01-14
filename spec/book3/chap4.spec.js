describe('Mixing (Up) "Class" Objects', () => {
  describe('mixins', () => {
    describe('explicit', () => {
      const mixin = (sourceObj, targetObj) => ({...sourceObj, ...targetObj});
      const Vehicle = {
        engines: 1,

        ignition: function () {
          return 'Turning on my engine.';
        },

        drive: function () {
          return `${this.ignition()} Steering and moving forward!`;
        }
      };

      it('should combine the objects', () => {
        const Car = mixin(Vehicle, {
          wheels: 4,

          drive: function () {
            return `${Vehicle.drive.call(this)} Rolling on all "${this.wheels}" wheels!`
          }
        });

        expect(Car.drive()).toBe('Turning on my engine. Steering and moving forward! Rolling on all "4" wheels!')
      });
    });

    describe('implicit', () => {
      const Something = {
        cool: function () {
          this.greeting = 'Hello World!';
          this.count = this.count ? this.count++ : 1;
        }
      };
      const Another = {
        cool: function () {
          Something.cool.call(this);
        }
      };

      beforeEach(() => {
        Something.cool();
        Another.cool();
      });

      it('should increment Something count when it is cool', () => {
        expect(Something.count).toBe(1);
      });

      it('should have a greeting for Something', () => {
        expect(Something.greeting).toBe('Hello World!');
      });

      it('should increment Another count when it is cool', () => {
        expect(Another.count).toBe(1);
      });

      it('should have a greeting for Another', () => {
        expect(Another.greeting).toBe('Hello World!');
      });
    });
  });

  describe('parasitic inheritance', () => {
    function Vehicle() {
      this.engines = 1;
    }

    Vehicle.prototype.ignition = function () {
      return 'Turning on my engine.';
    };

    Vehicle.prototype.drive = function () {
      return `${this.ignition()} Steering and moving forward!`;
    };

    function Car() {
      const car = new Vehicle();

      car.wheels = 4;

      const vehDrive = car.drive;

      car.drive = function () {
        return `${vehDrive.call(this)} Rolling on all "${this.wheels}" wheels!`;
      };

      return car;
    }

    it('should make car a vehicle', () => {
      let car = new Car();
      expect(car.drive()).toBe('Turning on my engine. Steering and moving forward! Rolling on all "4" wheels!')
    });
  });
});