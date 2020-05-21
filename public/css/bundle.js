
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Tailwindcss.svelte generated by Svelte v3.19.2 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwindcss> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tailwindcss", $$slots, []);
    	return [];
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* .yarn\cache\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\node_modules\svelte-tailwind-material\src\widgets\Button.svelte generated by Svelte v3.19.2 */

    const file = ".yarn\\cache\\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\\node_modules\\svelte-tailwind-material\\src\\widgets\\Button.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", /*cls*/ ctx[0]);
    			add_location(button, file, 52, 0, 1206);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[16], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16384) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[14], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null));
    			}

    			if (!current || dirty & /*cls*/ 1) {
    				attr_dev(button, "class", /*cls*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { text = false } = $$props;
    	let { fab = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { tile = false } = $$props;
    	let { block = false } = $$props;
    	let { xs = false } = $$props;
    	let { sm = false } = $$props;
    	let { lg = false } = $$props;
    	let { xl = false } = $$props;
    	let { textColor = "text-black" } = $$props;
    	let { outlineColor = "border-black" } = $$props;
    	let { bgColor = "bg-transparent" } = $$props;
    	let cls = "focus:outline-none uppercase tracking-wide ripple";

    	if (outlined) {
    		cls += ` border border-solid ${textColor} ${outlineColor} ${bgColor} hover:elevation-1 active:elevation-0`;
    	} else if (text) {
    		cls += ` ${textColor} ${bgColor} hover:elevation-1 active:elevation-0`;
    	} else {
    		cls += ` elevation-2 hover:elevation-4 active:elevation-0 ${textColor} ${bgColor}`;
    	}

    	if (rounded) {
    		cls += " rounded-full";
    	}

    	if (fab) {
    		cls += " rounded-full flex items-center justify-center";
    	}

    	if (!tile) {
    		cls += " rounded";
    	}

    	if (block) {
    		cls += " block w-full";
    	}

    	if (xs) {
    		cls += " h-5 text-xs px-2";
    	} else if (sm) {
    		cls += " h-6 text-sm px-3";
    	} else if (lg) {
    		cls += " h-10 text-lg px-5";
    	} else if (xl) {
    		cls += " h-12 text-xl px-6";
    	} else {
    		cls += " h-8 text-base px-4";
    	}

    	cls = cls.trim();

    	const writable_props = [
    		"text",
    		"fab",
    		"outlined",
    		"rounded",
    		"tile",
    		"block",
    		"xs",
    		"sm",
    		"lg",
    		"xl",
    		"textColor",
    		"outlineColor",
    		"bgColor"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("fab" in $$props) $$invalidate(2, fab = $$props.fab);
    		if ("outlined" in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ("rounded" in $$props) $$invalidate(4, rounded = $$props.rounded);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("block" in $$props) $$invalidate(6, block = $$props.block);
    		if ("xs" in $$props) $$invalidate(7, xs = $$props.xs);
    		if ("sm" in $$props) $$invalidate(8, sm = $$props.sm);
    		if ("lg" in $$props) $$invalidate(9, lg = $$props.lg);
    		if ("xl" in $$props) $$invalidate(10, xl = $$props.xl);
    		if ("textColor" in $$props) $$invalidate(11, textColor = $$props.textColor);
    		if ("outlineColor" in $$props) $$invalidate(12, outlineColor = $$props.outlineColor);
    		if ("bgColor" in $$props) $$invalidate(13, bgColor = $$props.bgColor);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		text,
    		fab,
    		outlined,
    		rounded,
    		tile,
    		block,
    		xs,
    		sm,
    		lg,
    		xl,
    		textColor,
    		outlineColor,
    		bgColor,
    		cls
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("fab" in $$props) $$invalidate(2, fab = $$props.fab);
    		if ("outlined" in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ("rounded" in $$props) $$invalidate(4, rounded = $$props.rounded);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("block" in $$props) $$invalidate(6, block = $$props.block);
    		if ("xs" in $$props) $$invalidate(7, xs = $$props.xs);
    		if ("sm" in $$props) $$invalidate(8, sm = $$props.sm);
    		if ("lg" in $$props) $$invalidate(9, lg = $$props.lg);
    		if ("xl" in $$props) $$invalidate(10, xl = $$props.xl);
    		if ("textColor" in $$props) $$invalidate(11, textColor = $$props.textColor);
    		if ("outlineColor" in $$props) $$invalidate(12, outlineColor = $$props.outlineColor);
    		if ("bgColor" in $$props) $$invalidate(13, bgColor = $$props.bgColor);
    		if ("cls" in $$props) $$invalidate(0, cls = $$props.cls);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cls,
    		text,
    		fab,
    		outlined,
    		rounded,
    		tile,
    		block,
    		xs,
    		sm,
    		lg,
    		xl,
    		textColor,
    		outlineColor,
    		bgColor,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			text: 1,
    			fab: 2,
    			outlined: 3,
    			rounded: 4,
    			tile: 5,
    			block: 6,
    			xs: 7,
    			sm: 8,
    			lg: 9,
    			xl: 10,
    			textColor: 11,
    			outlineColor: 12,
    			bgColor: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sm() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sm(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lg() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lg(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xl() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xl(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlineColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlineColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* .yarn\cache\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\node_modules\svelte-tailwind-material\src\widgets\Dialog.svelte generated by Svelte v3.19.2 */
    const file$1 = ".yarn\\cache\\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\\node_modules\\svelte-tailwind-material\\src\\widgets\\Dialog.svelte";

    // (8:0) {#if visible}
    function create_if_block(ctx) {
    	let div2;
    	let div0;
    	let div0_transition;
    	let t;
    	let div1;
    	let div1_transition;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "absolute h-full w-full bg-black opacity-50");
    			add_location(div0, file$1, 9, 4, 236);
    			attr_dev(div1, "class", "z-40");
    			add_location(div1, file$1, 13, 4, 410);
    			attr_dev(div2, "class", "fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center z-40");
    			add_location(div2, file$1, 8, 2, 144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    			dispose = listen_dev(div0, "click", /*click_handler*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 100 }, true);
    				div0_transition.run(1);
    			});

    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { duration: 200 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 100 }, false);
    			div0_transition.run(0);
    			transition_out(default_slot, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { duration: 200 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div0_transition) div0_transition.end();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_transition) div1_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(8:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { visible = false } = $$props;
    	let { permanent = false } = $$props;
    	const writable_props = ["visible", "permanent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dialog", $$slots, ['default']);

    	const click_handler = () => {
    		if (!permanent) $$invalidate(0, visible = false);
    	};

    	$$self.$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("permanent" in $$props) $$invalidate(1, permanent = $$props.permanent);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade, scale, visible, permanent });

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("permanent" in $$props) $$invalidate(1, permanent = $$props.permanent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, permanent, $$scope, $$slots, click_handler];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { visible: 0, permanent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get visible() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get permanent() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set permanent(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* .yarn\cache\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\node_modules\svelte-tailwind-material\src\widgets\NavigationDrawer.svelte generated by Svelte v3.19.2 */
    const file$2 = ".yarn\\cache\\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\\node_modules\\svelte-tailwind-material\\src\\widgets\\NavigationDrawer.svelte";

    // (22:2) {#if visible}
    function create_if_block_2(ctx) {
    	let div;
    	let div_class_value;
    	let div_transition;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = `elevation-8 fixed top-0 bottom-0 left-0 z-40 ${/*marginTop*/ ctx[2]}`);
    			add_location(div, file$2, 22, 4, 657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    			}

    			if (!current || dirty & /*marginTop*/ 4 && div_class_value !== (div_class_value = `elevation-8 fixed top-0 bottom-0 left-0 z-40 ${/*marginTop*/ ctx[2]}`)) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: -300, duration: 300 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: -300, duration: 300 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(22:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if modal}
    function create_if_block$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(8:0) {#if modal}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#if visible}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let div0_transition;
    	let t;
    	let div1;
    	let div1_transition;
    	let div2_class_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "w-full h-full fixed left-0 bg-black opacity-50 z-30");
    			add_location(div0, file$2, 11, 6, 280);
    			attr_dev(div1, "class", "elevation-8 z-40");
    			toggle_class(div1, "`${marginTop}`", /*marginTop*/ ctx[2]);
    			add_location(div1, file$2, 14, 6, 446);
    			attr_dev(div2, "class", div2_class_value = `flex fixed top-0 bottom-0 z-40 left-0 right-0 ${/*marginTop*/ ctx[2]}`);
    			add_location(div2, file$2, 9, 4, 189);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    			dispose = listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    			}

    			if (dirty & /*marginTop*/ 4) {
    				toggle_class(div1, "`${marginTop}`", /*marginTop*/ ctx[2]);
    			}

    			if (!current || dirty & /*marginTop*/ 4 && div2_class_value !== (div2_class_value = `flex fixed top-0 bottom-0 z-40 left-0 right-0 ${/*marginTop*/ ctx[2]}`)) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 300 }, true);
    				div0_transition.run(1);
    			});

    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: -300, duration: 300 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { duration: 300 }, false);
    			div0_transition.run(0);
    			transition_out(default_slot, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: -300, duration: 300 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div0_transition) div0_transition.end();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_transition) div1_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(9:2) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*modal*/ ctx[1]) return 0;
    		if (/*visible*/ ctx[0]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { modal = false } = $$props;
    	let { visible = false } = $$props;
    	let { marginTop = "" } = $$props;
    	const writable_props = ["modal", "visible", "marginTop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavigationDrawer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NavigationDrawer", $$slots, ['default']);
    	const click_handler = () => $$invalidate(0, visible = !visible);

    	$$self.$set = $$props => {
    		if ("modal" in $$props) $$invalidate(1, modal = $$props.modal);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("marginTop" in $$props) $$invalidate(2, marginTop = $$props.marginTop);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fly, fade, modal, visible, marginTop });

    	$$self.$inject_state = $$props => {
    		if ("modal" in $$props) $$invalidate(1, modal = $$props.modal);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("marginTop" in $$props) $$invalidate(2, marginTop = $$props.marginTop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, modal, marginTop, $$scope, $$slots, click_handler];
    }

    class NavigationDrawer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { modal: 1, visible: 0, marginTop: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavigationDrawer",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get modal() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modal(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get marginTop() {
    		throw new Error("<NavigationDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set marginTop(value) {
    		throw new Error("<NavigationDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* .yarn\cache\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\node_modules\svelte-tailwind-material\src\widgets\Progress.svelte generated by Svelte v3.19.2 */
    const file$3 = ".yarn\\cache\\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\\node_modules\\svelte-tailwind-material\\src\\widgets\\Progress.svelte";

    function create_fragment$4(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", div0_class_value = "h-full w-1/2 absolute mdc-slider__track " + /*fillColor*/ ctx[1] + " move" + " svelte-ra8k17");
    			add_location(div0, file$3, 53, 4, 2344);
    			attr_dev(div1, "class", div1_class_value = "absolute w-full mdc-slider__track-container " + /*trackColor*/ ctx[0] + " " + /*height*/ ctx[2] + " svelte-ra8k17");
    			add_location(div1, file$3, 52, 2, 2260);
    			attr_dev(div2, "class", div2_class_value = "relative w-full " + /*height*/ ctx[2] + " block outline-none flex items-center" + " svelte-ra8k17");
    			add_location(div2, file$3, 50, 0, 2180);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 2 && div0_class_value !== (div0_class_value = "h-full w-1/2 absolute mdc-slider__track " + /*fillColor*/ ctx[1] + " move" + " svelte-ra8k17")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*trackColor, height*/ 5 && div1_class_value !== (div1_class_value = "absolute w-full mdc-slider__track-container " + /*trackColor*/ ctx[0] + " " + /*height*/ ctx[2] + " svelte-ra8k17")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*height*/ 4 && div2_class_value !== (div2_class_value = "relative w-full " + /*height*/ ctx[2] + " block outline-none flex items-center" + " svelte-ra8k17")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const progress = tweened(0, { duration: 200, easing: cubicOut });
    	let { trackColor = "bg-red-200" } = $$props;
    	let { fillColor = "bg-blue-500" } = $$props;
    	let { height = "h-1" } = $$props;
    	const writable_props = ["trackColor", "fillColor", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Progress> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Progress", $$slots, []);

    	$$self.$set = $$props => {
    		if ("trackColor" in $$props) $$invalidate(0, trackColor = $$props.trackColor);
    		if ("fillColor" in $$props) $$invalidate(1, fillColor = $$props.fillColor);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({
    		tweened,
    		cubicOut,
    		progress,
    		trackColor,
    		fillColor,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ("trackColor" in $$props) $$invalidate(0, trackColor = $$props.trackColor);
    		if ("fillColor" in $$props) $$invalidate(1, fillColor = $$props.fillColor);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [trackColor, fillColor, height];
    }

    class Progress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { trackColor: 0, fillColor: 1, height: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Progress",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get trackColor() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trackColor(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fillColor() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* .yarn\cache\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\node_modules\svelte-tailwind-material\src\widgets\Slider.svelte generated by Svelte v3.19.2 */

    const { Error: Error_1 } = globals;
    const file$4 = ".yarn\\cache\\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\\node_modules\\svelte-tailwind-material\\src\\widgets\\Slider.svelte";

    function create_fragment$5(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let t0;
    	let div3;
    	let svg;
    	let circle;
    	let svg_class_value;
    	let t1;
    	let div2;
    	let div2_class_value;
    	let div4_resize_listener;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", div0_class_value = "h-full w-full absolute mdc-slider__track " + /*trackFilledColor*/ ctx[2] + " svelte-16sjob3");
    			set_style(div0, "transform", "scaleX(" + /*normalisedValue*/ ctx[3] + ")");
    			add_location(div0, file$4, 191, 4, 7483);
    			attr_dev(div1, "class", div1_class_value = "absolute w-full mdc-slider__track-container " + /*trackEmptyColor*/ ctx[1] + " svelte-16sjob3");
    			add_location(div1, file$4, 190, 2, 7403);
    			attr_dev(circle, "cx", "10.5");
    			attr_dev(circle, "cy", "10.5");
    			attr_dev(circle, "r", "7.875");
    			add_location(circle, file$4, 203, 6, 7930);
    			attr_dev(svg, "class", svg_class_value = "absolute left-0 top-0 fill-current " + /*thumbColor*/ ctx[0] + " mdc-slider__thumb" + " svelte-16sjob3");
    			set_style(svg, "transform", "scale(" + /*thumbSize*/ ctx[6] + ")");
    			attr_dev(svg, "width", "21");
    			attr_dev(svg, "height", "21");
    			add_location(svg, file$4, 198, 4, 7758);
    			set_style(div2, "transform", "scale(1.125)");
    			attr_dev(div2, "class", div2_class_value = "mdc-slider__focus-ring " + /*trackFilledColor*/ ctx[2] + " hover:opacity-25\n      opacity-0" + " svelte-16sjob3");
    			add_location(div2, file$4, 205, 4, 7985);
    			attr_dev(div3, "class", "mdc-slider__thumb-container svelte-16sjob3");
    			set_style(div3, "transform", "translateX(" + /*width*/ ctx[4] * /*normalisedValue*/ ctx[3] + "px) translateX(-50%)");
    			add_location(div3, file$4, 195, 2, 7627);
    			attr_dev(div4, "class", "relative w-full h-8 cursor-pointer block outline-none mdc-slider svelte-16sjob3");
    			attr_dev(div4, "tabindex", "0");
    			attr_dev(div4, "role", "slider");
    			add_render_callback(() => /*div4_elementresize_handler*/ ctx[20].call(div4));
    			add_location(div4, file$4, 179, 0, 6949);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, svg);
    			append_dev(svg, circle);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			div4_resize_listener = add_resize_listener(div4, /*div4_elementresize_handler*/ ctx[20].bind(div4));
    			/*div4_binding*/ ctx[21](div4);

    			dispose = [
    				listen_dev(div4, "touchstart", stop_propagation(prevent_default(/*touchStart*/ ctx[7])), false, true, true),
    				listen_dev(div4, "touchmove", stop_propagation(prevent_default(/*touchMove*/ ctx[8])), false, true, true),
    				listen_dev(div4, "touchend", stop_propagation(prevent_default(/*dragEnd*/ ctx[10])), false, true, true),
    				listen_dev(div4, "pointerdown", stop_propagation(prevent_default(/*dragStart*/ ctx[9])), false, true, true),
    				listen_dev(div4, "pointerup", stop_propagation(prevent_default(/*dragEnd*/ ctx[10])), false, true, true)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*trackFilledColor*/ 4 && div0_class_value !== (div0_class_value = "h-full w-full absolute mdc-slider__track " + /*trackFilledColor*/ ctx[2] + " svelte-16sjob3")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*normalisedValue*/ 8) {
    				set_style(div0, "transform", "scaleX(" + /*normalisedValue*/ ctx[3] + ")");
    			}

    			if (dirty & /*trackEmptyColor*/ 2 && div1_class_value !== (div1_class_value = "absolute w-full mdc-slider__track-container " + /*trackEmptyColor*/ ctx[1] + " svelte-16sjob3")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*thumbColor*/ 1 && svg_class_value !== (svg_class_value = "absolute left-0 top-0 fill-current " + /*thumbColor*/ ctx[0] + " mdc-slider__thumb" + " svelte-16sjob3")) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*thumbSize*/ 64) {
    				set_style(svg, "transform", "scale(" + /*thumbSize*/ ctx[6] + ")");
    			}

    			if (dirty & /*trackFilledColor*/ 4 && div2_class_value !== (div2_class_value = "mdc-slider__focus-ring " + /*trackFilledColor*/ ctx[2] + " hover:opacity-25\n      opacity-0" + " svelte-16sjob3")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*width, normalisedValue*/ 24) {
    				set_style(div3, "transform", "translateX(" + /*width*/ ctx[4] * /*normalisedValue*/ ctx[3] + "px) translateX(-50%)");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			div4_resize_listener.cancel();
    			/*div4_binding*/ ctx[21](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function roundToStep(v, step) {
    	if (step == null) {
    		return v;
    	}

    	return Math.round(v / step) * step;
    }

    function scaleValue(v, oldMin, oldMax, newMin, newMax) {
    	if (v < oldMin) {
    		return newMin;
    	}

    	if (v > oldMax) {
    		return newMax;
    	}

    	const oldRange = oldMax - oldMin;
    	const newRange = newMax - newMin;

    	if (oldRange <= 0 || newRange <= 0) {
    		throw new Error("max should be greater than min");
    	}

    	return +((v - oldMin) * newRange / oldRange + newMin).toPrecision(12);
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { min = 0 } = $$props;
    	let { max = 1 } = $$props;
    	let { step = undefined } = $$props;
    	let { thumbColor = "text-blue-500" } = $$props;
    	let { trackEmptyColor = "bg-blue-200" } = $$props;
    	let { trackFilledColor = "bg-blue-500" } = $$props;
    	let normalisedValue;
    	let normalisedStep = undefined;
    	let width;
    	let container;
    	let oldVal;
    	let dragStartX;
    	let mousedown = false;

    	function touchStart(e) {
    		if (window.PointerEvent) {
    			return;
    		}

    		const rect = container.getBoundingClientRect();
    		const x = e.touches[0].clientX - rect.left;
    		const v = x / width;

    		if (v < 0) {
    			$$invalidate(3, normalisedValue = 0);
    		} else if (v > 1) {
    			$$invalidate(3, normalisedValue = 1);
    		} else {
    			$$invalidate(3, normalisedValue = roundToStep(v, normalisedStep));
    		}

    		dragStartX = e.touches[0].screenX;
    		oldVal = normalisedValue;
    		$$invalidate(11, value = scaleValue(normalisedValue, 0, 1, min, max));
    		$$invalidate(18, mousedown = true);
    	}

    	function touchMove(e) {
    		if (window.PointerEvent) {
    			return;
    		}

    		if (!mousedown) {
    			return;
    		}

    		const change = e.touches[0].screenX - dragStartX;
    		const v = change / width + oldVal;

    		if (v < 0) {
    			$$invalidate(3, normalisedValue = 0);
    		} else if (v > 1) {
    			$$invalidate(3, normalisedValue = 1);
    		} else {
    			$$invalidate(3, normalisedValue = roundToStep(v, normalisedStep));
    		}

    		$$invalidate(11, value = scaleValue(normalisedValue, 0, 1, min, max));
    	}

    	function dragStart(e) {
    		const rect = container.getBoundingClientRect();
    		const x = e.clientX - rect.left; //x position within the element.
    		const v = x / width;

    		if (v < 0) {
    			$$invalidate(3, normalisedValue = 0);
    		} else if (v > 1) {
    			$$invalidate(3, normalisedValue = 1);
    		} else {
    			$$invalidate(3, normalisedValue = roundToStep(v, normalisedStep));
    		}

    		dragStartX = e.screenX;
    		oldVal = normalisedValue;
    		$$invalidate(18, mousedown = true);
    		$$invalidate(11, value = scaleValue(normalisedValue, 0, 1, min, max));
    		document.body.addEventListener("pointermove", dragging);
    	}

    	function dragging(e) {
    		if (e.pressure === 0) {
    			document.body.removeEventListener("pointermove", dragging);
    			$$invalidate(18, mousedown = false);
    			return;
    		}

    		if (!mousedown) {
    			return;
    		}

    		const change = e.screenX - dragStartX;
    		const v = change / width + oldVal;

    		if (v < 0) {
    			$$invalidate(3, normalisedValue = 0);
    		} else if (v > 1) {
    			$$invalidate(3, normalisedValue = 1);
    		} else {
    			$$invalidate(3, normalisedValue = roundToStep(v, normalisedStep));
    		}

    		$$invalidate(11, value = scaleValue(normalisedValue, 0, 1, min, max));
    	}

    	function dragEnd(e) {
    		document.body.removeEventListener("pointermove", dragging);
    		$$invalidate(18, mousedown = false);
    	}

    	let thumbSize = 0.75;

    	const writable_props = [
    		"value",
    		"min",
    		"max",
    		"step",
    		"thumbColor",
    		"trackEmptyColor",
    		"trackFilledColor"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Slider", $$slots, []);

    	function div4_elementresize_handler() {
    		width = this.clientWidth;
    		$$invalidate(4, width);
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(5, container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(11, value = $$props.value);
    		if ("min" in $$props) $$invalidate(12, min = $$props.min);
    		if ("max" in $$props) $$invalidate(13, max = $$props.max);
    		if ("step" in $$props) $$invalidate(14, step = $$props.step);
    		if ("thumbColor" in $$props) $$invalidate(0, thumbColor = $$props.thumbColor);
    		if ("trackEmptyColor" in $$props) $$invalidate(1, trackEmptyColor = $$props.trackEmptyColor);
    		if ("trackFilledColor" in $$props) $$invalidate(2, trackFilledColor = $$props.trackFilledColor);
    	};

    	$$self.$capture_state = () => ({
    		value,
    		min,
    		max,
    		step,
    		thumbColor,
    		trackEmptyColor,
    		trackFilledColor,
    		normalisedValue,
    		normalisedStep,
    		width,
    		container,
    		oldVal,
    		dragStartX,
    		mousedown,
    		roundToStep,
    		scaleValue,
    		touchStart,
    		touchMove,
    		dragStart,
    		dragging,
    		dragEnd,
    		thumbSize
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(11, value = $$props.value);
    		if ("min" in $$props) $$invalidate(12, min = $$props.min);
    		if ("max" in $$props) $$invalidate(13, max = $$props.max);
    		if ("step" in $$props) $$invalidate(14, step = $$props.step);
    		if ("thumbColor" in $$props) $$invalidate(0, thumbColor = $$props.thumbColor);
    		if ("trackEmptyColor" in $$props) $$invalidate(1, trackEmptyColor = $$props.trackEmptyColor);
    		if ("trackFilledColor" in $$props) $$invalidate(2, trackFilledColor = $$props.trackFilledColor);
    		if ("normalisedValue" in $$props) $$invalidate(3, normalisedValue = $$props.normalisedValue);
    		if ("normalisedStep" in $$props) normalisedStep = $$props.normalisedStep;
    		if ("width" in $$props) $$invalidate(4, width = $$props.width);
    		if ("container" in $$props) $$invalidate(5, container = $$props.container);
    		if ("oldVal" in $$props) oldVal = $$props.oldVal;
    		if ("dragStartX" in $$props) dragStartX = $$props.dragStartX;
    		if ("mousedown" in $$props) $$invalidate(18, mousedown = $$props.mousedown);
    		if ("thumbSize" in $$props) $$invalidate(6, thumbSize = $$props.thumbSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, min, max*/ 14336) {
    			 $$invalidate(3, normalisedValue = scaleValue(value, min, max, 0, 1));
    		}

    		if ($$self.$$.dirty & /*step, max, min*/ 28672) {
    			 if (step != null) {
    				normalisedStep = step / (max - min);
    			} else {
    				normalisedStep = undefined;
    			}
    		}

    		if ($$self.$$.dirty & /*mousedown*/ 262144) {
    			 $$invalidate(6, thumbSize = mousedown ? 1.4 : 0.75);
    		}
    	};

    	return [
    		thumbColor,
    		trackEmptyColor,
    		trackFilledColor,
    		normalisedValue,
    		width,
    		container,
    		thumbSize,
    		touchStart,
    		touchMove,
    		dragStart,
    		dragEnd,
    		value,
    		min,
    		max,
    		step,
    		normalisedStep,
    		oldVal,
    		dragStartX,
    		mousedown,
    		dragging,
    		div4_elementresize_handler,
    		div4_binding
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			value: 11,
    			min: 12,
    			max: 13,
    			step: 14,
    			thumbColor: 0,
    			trackEmptyColor: 1,
    			trackFilledColor: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[11] === undefined && !("value" in props)) {
    			console.warn("<Slider> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error_1("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error_1("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error_1("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error_1("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error_1("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error_1("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error_1("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error_1("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbColor() {
    		throw new Error_1("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbColor(value) {
    		throw new Error_1("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trackEmptyColor() {
    		throw new Error_1("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trackEmptyColor(value) {
    		throw new Error_1("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trackFilledColor() {
    		throw new Error_1("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trackFilledColor(value) {
    		throw new Error_1("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* .yarn\cache\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\node_modules\svelte-tailwind-material\src\widgets\Spinner.svelte generated by Svelte v3.19.2 */

    const file$5 = ".yarn\\cache\\svelte-tailwind-material-npm-0.1.2-56d10bd436-2.zip\\node_modules\\svelte-tailwind-material\\src\\widgets\\Spinner.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let circle;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "path svelte-15d1nfc");
    			attr_dev(circle, "cx", "25");
    			attr_dev(circle, "cy", "25");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke-width", "5");
    			add_location(circle, file$5, 66, 2, 3564);
    			attr_dev(svg, "class", svg_class_value = "spinner stroke-current " + /*color*/ ctx[0] + " " + /*width*/ ctx[1] + " " + /*height*/ ctx[2] + " svelte-15d1nfc");
    			attr_dev(svg, "viewBox", "0 0 50 50");
    			add_location(svg, file$5, 65, 0, 3480);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color, width, height*/ 7 && svg_class_value !== (svg_class_value = "spinner stroke-current " + /*color*/ ctx[0] + " " + /*width*/ ctx[1] + " " + /*height*/ ctx[2] + " svelte-15d1nfc")) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { color = "text-purple-500" } = $$props;
    	let { width = "w-8" } = $$props;
    	let { height = "h-8" } = $$props;
    	const writable_props = ["color", "width", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", $$slots, []);

    	$$self.$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({ color, width, height });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, width, height];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { color: 0, width: 1, height: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get color() {
    		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.2 */

    const file$6 = "src\\App.svelte";

    // (32:4) <Button textColor="text-orange-500" on:click={() => (visible = !visible)}>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show drawer");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(32:4) <Button textColor=\\\"text-orange-500\\\" on:click={() => (visible = !visible)}>",
    		ctx
    	});

    	return block;
    }

    // (35:4) <Button       textColor="text-green-500"       on:click={() => (dialogVisible = !dialogVisible)}>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show dialog");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(35:4) <Button       textColor=\\\"text-green-500\\\"       on:click={() => (dialogVisible = !dialogVisible)}>",
    		ctx
    	});

    	return block;
    }

    // (49:2) <NavigationDrawer bind:visible modal>
    function create_default_slot_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "halo how are you";
    			attr_dev(div, "class", "bg-white p-2 h-full");
    			add_location(div, file$6, 49, 4, 1357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(49:2) <NavigationDrawer bind:visible modal>",
    		ctx
    	});

    	return block;
    }

    // (54:6) <Button on:click={() => (dialogVisible = false)}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(54:6) <Button on:click={() => (dialogVisible = false)}>",
    		ctx
    	});

    	return block;
    }

    // (52:2) <Dialog bind:visible={dialogVisible} permanent>
    function create_default_slot(ctx) {
    	let div;
    	let current;

    	const button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "bg-white w-64 h-48 flex flex-row justify-center items-center");
    			add_location(div, file$6, 52, 4, 1489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(52:2) <Dialog bind:visible={dialogVisible} permanent>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div0;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let updating_visible;
    	let t10;
    	let updating_visible_1;
    	let current;
    	const tailwindcss = new Tailwindcss({ $$inline: true });
    	const spinner = new Spinner({ $$inline: true });

    	const button0 = new Button({
    			props: {
    				textColor: "text-orange-500",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[5]);

    	const button1 = new Button({
    			props: {
    				textColor: "text-green-500",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[6]);
    	const progress = new Progress({ $$inline: true });
    	const slider = new Slider({ props: { value: 0.28 }, $$inline: true });

    	function navigationdrawer_visible_binding(value) {
    		/*navigationdrawer_visible_binding*/ ctx[7].call(null, value);
    	}

    	let navigationdrawer_props = {
    		modal: true,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[1] !== void 0) {
    		navigationdrawer_props.visible = /*visible*/ ctx[1];
    	}

    	const navigationdrawer = new NavigationDrawer({
    			props: navigationdrawer_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(navigationdrawer, "visible", navigationdrawer_visible_binding));

    	function dialog_visible_binding(value) {
    		/*dialog_visible_binding*/ ctx[9].call(null, value);
    	}

    	let dialog_props = {
    		permanent: true,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*dialogVisible*/ ctx[2] !== void 0) {
    		dialog_props.visible = /*dialogVisible*/ ctx[2];
    	}

    	const dialog = new Dialog({ props: dialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog, "visible", dialog_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(tailwindcss.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text("Hello ");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = text("!");
    			t4 = space();
    			create_component(spinner.$$.fragment);
    			t5 = space();
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t6 = space();
    			create_component(button1.$$.fragment);
    			t7 = space();
    			create_component(progress.$$.fragment);
    			t8 = space();
    			create_component(slider.$$.fragment);
    			t9 = space();
    			create_component(navigationdrawer.$$.fragment);
    			t10 = space();
    			create_component(dialog.$$.fragment);
    			attr_dev(h1, "class", "svelte-1calux7");
    			add_location(h1, file$6, 28, 2, 737);
    			attr_dev(div0, "class", "flex flex-row-reverse");
    			add_location(div0, file$6, 30, 2, 776);
    			attr_dev(div1, "class", "m-16");
    			add_location(div1, file$6, 27, 0, 716);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwindcss, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			append_dev(div1, t4);
    			mount_component(spinner, div1, null);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			mount_component(button0, div0, null);
    			append_dev(div0, t6);
    			mount_component(button1, div0, null);
    			append_dev(div1, t7);
    			mount_component(progress, div1, null);
    			append_dev(div1, t8);
    			mount_component(slider, div1, null);
    			append_dev(div1, t9);
    			mount_component(navigationdrawer, div1, null);
    			append_dev(div1, t10);
    			mount_component(dialog, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const navigationdrawer_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				navigationdrawer_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 2) {
    				updating_visible = true;
    				navigationdrawer_changes.visible = /*visible*/ ctx[1];
    				add_flush_callback(() => updating_visible = false);
    			}

    			navigationdrawer.$set(navigationdrawer_changes);
    			const dialog_changes = {};

    			if (dirty & /*$$scope, dialogVisible*/ 1028) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty & /*dialogVisible*/ 4) {
    				updating_visible_1 = true;
    				dialog_changes.visible = /*dialogVisible*/ ctx[2];
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwindcss.$$.fragment, local);
    			transition_in(spinner.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(progress.$$.fragment, local);
    			transition_in(slider.$$.fragment, local);
    			transition_in(navigationdrawer.$$.fragment, local);
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwindcss.$$.fragment, local);
    			transition_out(spinner.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(progress.$$.fragment, local);
    			transition_out(slider.$$.fragment, local);
    			transition_out(navigationdrawer.$$.fragment, local);
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwindcss, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(spinner);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(progress);
    			destroy_component(slider);
    			destroy_component(navigationdrawer);
    			destroy_component(dialog);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let visible = false;
    	let dialogVisible = false;
    	let items = ["SGP", "MYS", "THA", "HKG", "CHN"];
    	let value = "SGP";
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => $$invalidate(1, visible = !visible);
    	const click_handler_1 = () => $$invalidate(2, dialogVisible = !dialogVisible);

    	function navigationdrawer_visible_binding(value) {
    		visible = value;
    		$$invalidate(1, visible);
    	}

    	const click_handler_2 = () => $$invalidate(2, dialogVisible = false);

    	function dialog_visible_binding(value) {
    		dialogVisible = value;
    		$$invalidate(2, dialogVisible);
    	}

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		Tailwindcss,
    		Button,
    		Spinner,
    		Progress,
    		Slider,
    		NavigationDrawer,
    		Dialog,
    		name,
    		visible,
    		dialogVisible,
    		items,
    		value
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("visible" in $$props) $$invalidate(1, visible = $$props.visible);
    		if ("dialogVisible" in $$props) $$invalidate(2, dialogVisible = $$props.dialogVisible);
    		if ("items" in $$props) items = $$props.items;
    		if ("value" in $$props) value = $$props.value;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		visible,
    		dialogVisible,
    		items,
    		value,
    		click_handler,
    		click_handler_1,
    		navigationdrawer_visible_binding,
    		click_handler_2,
    		dialog_visible_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
