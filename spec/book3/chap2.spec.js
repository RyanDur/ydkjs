describe('this All Makes Sense Now!', () => {
  describe('call-stack vs. call-site', () => {
    it('should be demonstrated', () => {
      function baz(call) {
        return bar({
          stack: `${call.stack} -> bar`,
          site: `${call.site} <- baz`
        });
      }

      function bar(call) {
        return foo({
          stack: `${call.stack} -> foo`,
          site: `${call.site} <- bar`
        });
      }

      function foo(call) {
        return call;
      }

      expect(baz({stack: 'baz', site: 'global'})).toEqual({
        stack: 'baz -> bar -> foo',
        site: 'global <- baz <- bar'
      });
    });
  });

  describe('default binding', () => {
    describe('not in strict mode', () => {
      it('should default to the global object', () => {
        function foo() {
          return this.c;
        }

        c = 2;
        expect(foo()).toBe(2)
      });
    });

    describe('in strict mode', () => {
      it('should default to undefined', () => {
        'use strict';

        function foo() {
          return this.b;
        }

        expect(function () {
          b = 2;
          foo();
        }).toThrow(new ReferenceError('b is not defined'));
      });
    });
  });

  describe('implicit binding', () => {
    describe('with a context object', () => {
      it('should use the context it is within', () => {
        function foo() {
          return this.doop;
        }

        const obj = {
          doop: 4,
          foo: foo
        };

        expect(obj.foo()).toBe(4);
      });

      it('should only reference the top/last level of an object property reference chain', () => {
        function foo() {
          return this.a;
        }

        const obj2 = {
          a: 42,
          foo: foo
        };

        const obj1 = {
          a: 2,
          obj2: obj2
        };

        expect(obj1.obj2.foo()).toBe(42);
      });
    });

    describe('when lost', () => {
      describe('an un-decorated call', () => {
        it('should fallback to the default binding', () => {
          function foo() {
            return this.a1;
          }

          const obj = {
            a1: 2,
            foo: foo
          };

          const bar = obj.foo; // function reference/alias!

          a1 = 'oops, global';

          expect(bar()).toBe('oops, global');
          expect(obj.foo()).toBe(2);
        });
      });

      describe('an implicit reference assignment', () => {
        it('should fallback to the default binding', () => {
          function foo() {
            return this.a2;
          }

          function doFoo(fn) {
            return fn(); // <-- call-site!
          }

          const obj = {
            a2: 3,
            foo: foo
          };

          a2 = 'oops, global';

          expect(doFoo(obj.foo)).toBe('oops, global');
          expect(obj.foo()).toBe(3);
        });
      });
    });
  });

  describe('explicit binding', () => {
    describe('call', () => {
      it('should bind a context to a function invocation', () => {
        function foo() {
          return this.a;
        }

        const obj = {
          a: 2345
        };

        expect(foo.call(obj)).toBe(2345);
      });
    });

    describe('hard binding', () => {
      it('can not be overridden', (done) => {
        function foo() {
          return this.a;
        }

        const obj = {
          a: 2
        };

        const bar = function () {
          return foo.call(obj);
        };

        let value;

        setTimeout(function () {
          value = bar();
        }, 100);

        setTimeout(function () {
          expect(value).toBe(2);
          done();
        }, 101);

        // `bar` hard binds `foo`'s `this` to `obj`
        // so that it cannot be overriden
        expect(bar.call(global)).toBe(2);
      });

      it('should create a pass through for any arguments received', () => {
        function foo(something) {
          return this.a + something;
        }

        const obj = {
          a: 2
        };

        const bar = function () {
          return foo.apply(obj, arguments);
        };

        expect(bar(3)).toBe(5);
      });

      it('should be built into the language', () => {
        function foo(something) {
          return this.a + something;
        }

        function bind(fn, obj) {
          return function () {
            return fn.apply(obj, arguments);
          };
        }

        const obj = {
          a: 2
        };

        const boundFunction1 = bind(foo, obj);
        const boundFunction2 = foo.bind(obj);

        expect(boundFunction1(3)).toEqual(boundFunction2(3));
      });

      it('should have built in functions that take a context object', () => {
        function foo(el) {
          return `${el} ${this.id}`;
        }

        const obj = {
          id: 'awesome'
        };

        expect([1, 2, 3].map(foo, obj)).toEqual(['1 awesome', '2 awesome', '3 awesome']);
      });
    });
  });

  describe('new binding', () => {
    it('should set the `this` to the new object', () => {
      function Foo(a) {
        this.a = a;
      }

      const bar = new Foo(24);
      expect(bar.a).toBe(24);
    });
  });

  describe('precedence', () => {
    describe('implicit binding', () => {
      it('should have precedence over default binding', () => {
        function foo() {
          return this.doodoo;
        }

        const obj = {
          doodoo: 'WHAT!?',
          foo: foo
        };

        doodoo = 'NO!';

        expect(obj.foo()).toBe('WHAT!?');
        expect(foo()).toBe('NO!');
      });
    });

    describe('explicit binding', () => {
      it('should take precedence over default binding', () => {
        function foo() {
          return this.az;
        }

        az = 4567;

        expect(foo.call({az: 6})).toBe(6);
      });

      it('should take precedence over implicit binding', () => {
        function foo() {
          return this.a;
        }

        const obj1 = {
          a: 2,
          foo: foo
        };

        const obj2 = {
          a: 3,
          foo: foo
        };

        expect(obj1.foo()).toBe(2);
        expect(obj2.foo()).toBe(3);

        expect(obj1.foo.call(obj2)).toBe(3);
        expect(obj2.foo.call(obj1)).toBe(2);
      });
    });

    describe('new binding', () => {
      it('should take precedence over default binding', () => {
        function Foo() {
          this.az = 4;
        }

        az = 4567;

        let actual = new Foo();
        expect(actual.az).toBe(4);
      });

      it('should take precedence over implicit binding', () => {
        function foo(something) {
          this.a = something;
        }

        const obj1 = {
          foo: foo
        };

        obj1.foo(2);
        expect(obj1.a).toBe(2);

        const bar = new obj1.foo(4);
        expect(obj1.a).toBe(2);
        expect(bar.a).toBe(4);
      });

      it('should take precedence over explicit binding', () => {
        function foo(something) {
          this.a = something;
        }

        const obj1 = {};

        const bar = foo.bind(obj1);
        bar(2);
        expect(obj1.a).toBe(2);

        const baz = new bar(3);
        expect(obj1.a).toBe(2);
        expect(baz.a).toBe(3);
      });
    });
  });

  describe('binding exceptions', () => {
    describe('ignored this', () => {
      it('should apply the default binding if null is passed to call', () => {
        function foo() {
          return this.afoo;
        }

        afoo = 2;

        expect(foo.call(null)).toBe(2);
      });
    });

    describe('indirection', () => {
      it('should have the default binding when invoking an indirectly referenced function.', () => {
        function foo() {
          return this.a;
        }

        a = 2;
        const o = {a: 3, foo: foo};
        const p = {a: 4};

        expect(o.foo()).toBe(3);
        p.foo = o.foo;
        expect((p.foo = o.foo)()).toBe(2);
      });
    });
  });

  describe('lexical this', () => {
    describe('arrow functions', () => {
      it('should be bound to its first scope', () => {
        function foo() {
          return () => {
            return this.ab;
          };
        }

        const obj1 = {
          ab: 2
        };

        const obj2 = {
          ab: 3
        };

        const bar = foo.call(obj1);
        expect(bar.call(obj2)).toBe(2);
      });
    });
  });
});