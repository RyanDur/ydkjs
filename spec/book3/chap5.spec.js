describe('Prototypes', () => {
  describe('Setting & Shadowing Properties', () => {
    describe('prototype chain', () => {
      describe('If a normal data accessor (see Chapter 3) property named foo is found anywhere higher on the ' +
        "[[Prototype]] chain, and it's not marked as read-only (writable:false) then a new property called foo is added " +
        'directly to myObject, resulting in a shadowed property.', () => {
        it('should not add a new property called foo if found and is readonly', () => {
          const anotherObject = {
            a: 2
          };
          const myObject = Object.create(anotherObject, {
            foo: {writable: false, value: 56}
          });
          myObject.foo = 3;

          expect(myObject.foo).toBe(56);
          expect(myObject.hasOwnProperty('foo')).toBe(true);
          expect(anotherObject.hasOwnProperty('foo')).toBe(false);
        });

        it('should add a new property called if not found', () => {
          const anotherObject = {
            a: 2
          };
          const myObject = Object.create(anotherObject);
          myObject.foo = 3;

          expect(myObject.foo).toBe(3);
          expect(myObject.hasOwnProperty('foo')).toBe(true);
          expect(anotherObject.hasOwnProperty('foo')).toBe(false);
        });
      });

      describe("If a foo is found higher on the [[Prototype]] chain, but it's marked as read-only " +
        '(writable:false), then both the setting of that existing property as well as the creation of the shadowed ' +
        'property on myObject are disallowed. If the code is running in strict mode, an error will be thrown. Otherwise, ' +
        'the setting of the property value will silently be ignored. Either way, no shadowing occurs.', () => {
        const anotherObject = {
          a: 2
        };
        Object.defineProperty(anotherObject, 'foo', {writable: false, value: 'the world'});
        const myObject = Object.create(anotherObject);

        it('should not add a new property called foo if found on the parent and is readonly', () => {
          myObject.foo = 3;

          expect(myObject.foo).toBe('the world');
          expect(myObject.hasOwnProperty('foo')).toBe(false);
          expect(anotherObject.hasOwnProperty('foo')).toBe(true);
        });

        it('should throw an error if in strict mode', () => {
          'use strict';
          expect(() => {myObject.foo = 3})
            .toThrow(new TypeError("Cannot assign to read only property 'foo' of object '#<Object>'"));
        });
      });

      describe("If a foo is found higher on the [[Prototype]] chain and it's a setter (see Chapter 3), " +
        'then the setter will always be called. No foo will be added to (aka, shadowed on) myObject, nor will the ' +
        'foo setter be redefined.', () => {
        const anotherObject = {
          ac: 2,
          set foo(thing) {
            this.ac = thing;
          }
        };
        const myObject = Object.create(anotherObject);
        myObject.foo = 45;

        it('should use the setter if found', () => {
          expect(myObject.ac).toEqual(45);
        });

        it('should not add foo as a property', () => {
          expect(myObject.hasOwnProperty('foo')).toBe(false);
          expect(anotherObject.hasOwnProperty('foo')).toBe(true);
        });
      });
    });

    describe('implicit shadowing', () => {
      const anotherObject = {
        a: 2
      };

      const myObject = Object.create(anotherObject);

      it('should add the property to the child if used on child', () => {
        expect(anotherObject.a).toBe(2);
        expect(myObject.a).toBe(2);

        expect(anotherObject.hasOwnProperty( 'a' )).toBe(true);
        expect(myObject.hasOwnProperty( 'a' )).toBe(false);

        myObject.a++;

        expect(anotherObject.a).toBe(2);
        expect(myObject.a).toBe(3);

        expect(myObject.hasOwnProperty( 'a' )).toBe(true);
      });
    });
  });

  describe('Prototypal inheritance', () => {
    function Foo(name) {
      this.name = name;
    }

    Foo.prototype.myName = function () {
      return this.name;
    };

    function Bar(name, label) {
      Foo.call(this, name);
      this.label = label;
    }

    Bar.prototype = Object.create(Foo.prototype);
    Bar.prototype.myLabel = function () {
      return this.label;
    };

    const a = new Bar('a', 'obj a');

    it('should be linked to its parent', () => {
      expect(Bar.prototype.isPrototypeOf(a)).toBe(true);
    });

    it('should link its parent and grandparent', () => {
      expect(Foo.prototype.isPrototypeOf(Bar.prototype)).toBe(true);
    });

    it('should be linked to its grandparent', () => {
      expect(Foo.prototype.isPrototypeOf(a)).toBe(true);
    });

    describe('creating the empty object', () => {
      const ø = Object.create(null);

      it('should have a undefined prototype', () => {
        expect(ø.prototype).toBeUndefined();
      });
    });
  });

  describe('the constructor', () => {
    it('should link it by the constructor property if new is used', () => {
      const foo = function () {
        return 'something';
      };

      const bar = new foo();

      expect(bar.constructor === foo).toBe(true);
    });

    it('can be replaced after creation ', () => {
      function Foo() { /* .. */ }

      Foo.prototype = { /* .. */ };

      const a1 = new Foo();
      expect(a1.constructor).not.toBe(Foo);
      expect(a1.constructor).toBe(Object);
    });
  });
});
