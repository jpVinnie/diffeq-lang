import types = require("./types");
import utils = require("./utils");
import expr = require("./expr");

function __print(st: any[], out: any[]) {
	out.push(st.pop());
}

function __true(st: any[]) {
	st.push(true);
}

function __false(st: any[]) {
	st.push(false);
}

function __call(st: any[], out: any[]) {
	st.pop()(st, out);
}

function __len(st: any[]) {
	st.push(st.pop().length);
}

function __map(st: any[], out: any[]) {
	let fun = st.pop();
	let list = st.pop();
	st.push(list.map(obj => {
		st.push(obj);
		fun(st, out);
		return st.pop();
	}));
}

function __filter(st: any[], out: any[]) {
	let fun = st.pop();
	let list = st.pop();
	st.push(list.filter(obj => {
		st.push(obj);
		fun(st, out);
		return st.pop();
	}))
}

function __reduce(st: any[], out: any[]) {
	let fun = st.pop();
	let init_acc = st.pop();
	let list = st.pop();
	st.push(list.reduce((acc: any, curr: any) => {
		st.push(curr);
		st.push(acc);
		fun(st, out);
		return st.pop();
	}, init_acc));
}

function __times(st: any[]) {
	let times = st.pop();
	st.push((new Array(times)).fill(0));
}

function __range(st: any[]) {
	let start = st.pop();
	let stop = st.pop();
	if(start <= stop) {
		st.push(Array.from(new Array(stop - start), (_, i) => i + start));
	} else {
		st.push(Array.from(new Array(start - stop), (_, i) => start - i));
	}
}

function __srange(st: any[]) {
	let start = st.pop();
	let stop = st.pop();
	let step = st.pop();
	st.push(Array.from(
		new Array(Math.ceil(Math.abs((stop - start) / step))),
		(_, i) => i * step + start)
	);
}

function __enum(st: any[]) {
	st.push(st.pop().length);
	st.push(0);
	__range(st);
}

function __pi(st: any[]) {
	st.push(Math.PI);
}

function __tau(st: any[]) {
	st.push(2 * Math.PI);
}

function __e(st: any[]) {
	st.push(Math.E);
}

function __sin(st: any[]) {
	st.push(Math.sin(st.pop()));
}

function __cos(st: any[]) {
	st.push(Math.cos(st.pop()));
}

function __tan(st: any[]) {
	st.push(Math.tan(st.pop()));
}

function __cot(st: any[]) {
	st.push(1 / Math.tan(st.pop()));
}

function __sec(st: any[]) {
	st.push(1 / Math.cos(st.pop()));
}

function __csc(st: any[]) {
	st.push(1 / Math.sin(st.pop()));
}

function __show_expr(st: any[]) {
	st.push(`{${expr.stringify(st.pop())}}`);
}

function __eval(st: any[]) {
	let ast = st.pop();
	let x = st.pop();
	
	st.push(expr.eval_at(ast, x));
}

function __num_diff(st: any[]) {
	let ast = st.pop();
	let x = st.pop();
	let h = 1e-10;
	
	// Ratio of difference
	st.push((expr.eval_at(ast, x + h) - expr.eval_at(ast, x)) / h);
}

function __set_size(st: any[]) {
	window.graph_w = st.pop();
	window.graph_h = st.pop();
}

function __set_zoom(st: any[]) {
	window.graph_zoom = st.pop();
}

function eq(a: any, b: any): boolean {
	let a_type = utils.to_type(a);
	let b_type = utils.to_type(b);
	
	if(a_type != b_type)
		return false;
	else if(["number", "string", "boolean"].includes(a_type))
		return a == b;
	else if(a_type == "array")
		if(a.length != b.length)
			return false;
		else
			return a.every((obj, i) => eq(obj, b[i]));
	else
		return false;
}

let __ops = {
	
	// Comparison
	
	"=="(st: any[]) {
		st.push(eq(st.pop(), st.pop()));
	},
	
	"!="(st: any[]) {
		st.push(!eq(st.pop(), st.pop()));
	},
	
	"<="(st: any[]) {
		st.push(st.pop() <= st.pop());
	},
	
	">="(st: any[]) {
		st.push(st.pop() >= st.pop());
	},
	
	"<"(st: any[]) {
		st.push(st.pop() < st.pop());
	},
	
	">"(st: any[]) {
		st.push(st.pop() > st.pop());
	},
	
	// Arithmetic
	
	"+"(st: any[]) {
		st.push(st.pop() + st.pop());
	},
	
	"~"(st:any[]) {
		st.push(-st.pop());
	},
	
	"-"(st: any[]) {
		st.push(st.pop() - st.pop());
	},
	
	"*"(st: any[]) {
		st.push(st.pop() * st.pop());
	},
	
	"/"(st: any[]) {
		st.push(st.pop() / st.pop());
	},
	
	// Extra math
	
	"^"(st: any[]) {
		st.push(st.pop() ** st.pop());
	},
	
	"%%"(st: any[]) {
		st.push(st.pop() % st.pop() == 0);
	},
	
	"%"(st: any[]) {
		st.push(st.pop() % st.pop());
	},
	
	// Calculus
	
	"'"(st: any[]) {
		let derivative: types.Expr = expr.derive(st.pop());
		console.log(expr.stringify(derivative));
		let simplification: types.Expr = expr.simplify(derivative);
		console.log(expr.stringify(simplification));
		st.push(simplification);
	},
	
	// List/dictionary indexing
	
	"@="(st: any[]) {
		let [list, idx, val] = [st.pop(), st.pop(), st.pop()];
		list[idx] = val;
	},
	
	"@"(st: any[]) {
		let [list, idx] = [st.pop(), st.pop()];
		st.push(list[idx]);
	},
	
	// Boolean
	
	"&"(st: any[]) {
		st.push(st.pop() && st.pop());
	},
	
	"|"(st: any[]) {
		st.push(st.pop() || st.pop());
	},
	
	"!"(st: any[]) {
		st.push(!(st.pop()));
	},
	
	// Special interaction
	
	"?"(st: any[]) {
		st.push(window.res_hist[window.res_hist.length - 1]);
	},
	
	"??"(st: any[]) {
		st.push(window.res_hist[st.pop()]);
	}
};

export {__print, __true, __false, __call, __len, __map, __filter, __reduce, __times, __range, __srange, __enum, __pi, __tau, __e, __sin, __cos, __tan, __cot, __sec, __csc, __show_expr, __eval, __num_diff, __set_size, __set_zoom, __ops};