import { useRef, useEffect } from "react";

// usage : in componentDidUpdate(prevProps, prevState) :
//      traceProps.bind(this)(prevProps, prevState);
export function traceProps(prevProps: {}, prevState: {}, print: boolean = false) {
    if (!__DEV__) {
        console.error("Don't use `traceProps` on production builds!");
        return;
    }
    Object.entries(this.props).forEach(([key, val]) => {
        prevProps[key] !== val && console.log(`Prop '${key}' changed`);
        print && prevProps[key] !== val && console.log(`${prevProps[key]}' ===> ${val}`);
    }
    );
    if (this.state) {
        Object.entries(this.state).forEach(([key, val]) => {
            prevState[key] !== val && console.log(`State '${key}' changed`);
            print && prevState[key] !== val && console.log(`${prevState[key]}' ===> ${val}`);
        }
        );
    }
}

// usage : in function components : useTraceUpdate(props);
export function useTraceUpdate(props: {}) {
    if (!__DEV__) {
        console.error("Don't use `useTraceUpdate` on production builds!");
        return;
    }
    const prev = useRef(props);
    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                ps[k] = [prev.current[k], v];
            }
            return ps;
        }, {});
        if (Object.keys(changedProps).length > 0) {
            console.log('Changed props:', changedProps);
        }
        prev.current = props;
    });
}