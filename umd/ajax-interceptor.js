/**
 * 使用拦截器须知：
 * 需在 localStorage 里开启 ajax_interceptor 为真值
 * 需在 localStorage 配置 ajax_interceptor_rules，格式为
 * [{closed: false, match: '/x/x', text:{code:1, msg:'xxx', data}, path:'data.userId'}] // 其中 path 是可选项，只对返回值中的部分内容进行替换
 * 用户设置后，会将最新的拦截映射注入到 localStorage 中，下次刷新页面生效
 */

var _ajax_interceptor_ = {
  settings: {
    ajaxInterceptorSwitchOn: true,
    ajaxInterceptorRules: [],
  },
  originalXHR: window.XMLHttpRequest,
  myXHR: function () {
    let pageScriptEventDispatched = false;
    const modifyResponse = () => {
      _ajax_interceptor_.settings.ajaxInterceptorRules.forEach(
        ({ match, text = "{}", path }) => {
          if (match && this.responseURL.indexOf(match) > -1) {
            let origText = this.responseText;
            this.responseText = text;
            this.response = text;

            if (path) {
              // 如果需要部分替换
              try {
                let res = JSON.parse(origText);
                let pathArr = path.split(".");
                let lastPath = pathArr.pop();
                let tar = res;
                for (let i = 0; i < pathArr.length; i++) {
                  tar = tar[pathArr[i]];
                }
                tar[lastPath] = JSON.parse(text);
                this.responseText = JSON.stringify(res);
                this.response = JSON.stringify(res);
              } catch (error) {}
            }

            if (!pageScriptEventDispatched) {
              window.dispatchEvent(
                new CustomEvent("ajaxIntercepted", {
                  detail: { url: this.responseURL, match },
                })
              );
              pageScriptEventDispatched = true;
            }
          }
        }
      );
    };

    const xhr = new _ajax_interceptor_.originalXHR();
    for (let attr in xhr) {
      if (attr === "onreadystatechange") {
        xhr.onreadystatechange = (...args) => {
          if (this.readyState == 4) {
            // 请求成功
            if (_ajax_interceptor_.settings.ajaxInterceptorSwitchOn) {
              // 开启拦截
              modifyResponse();
            }
          }
          this.onreadystatechange && this.onreadystatechange.apply(this, args);
        };
        continue;
      } else if (attr === "onload") {
        xhr.onload = (...args) => {
          // 请求成功
          if (_ajax_interceptor_.settings.ajaxInterceptorSwitchOn) {
            // 开启拦截
            modifyResponse();
          }
          this.onload && this.onload.apply(this, args);
        };
        continue;
      }

      if (typeof xhr[attr] === "function") {
        this[attr] = xhr[attr].bind(xhr);
      } else {
        // responseText和response不是writeable的，但拦截时需要修改它，所以修改就存储在this[`_${attr}`]上
        if (attr === "responseText" || attr === "response") {
          Object.defineProperty(this, attr, {
            get: () =>
              this[`_${attr}`] == undefined ? xhr[attr] : this[`_${attr}`],
            set: (val) => (this[`_${attr}`] = val),
            enumerable: true,
          });
        } else {
          Object.defineProperty(this, attr, {
            get: () => xhr[attr],
            set: (val) => (xhr[attr] = val),
            enumerable: true,
          });
        }
      }
    }
  },

  originalFetch: window.fetch.bind(window),
  myFetch: function (...args) {
    return _ajax_interceptor_.originalFetch(...args).then((response) => {
      let txt = undefined;
      _ajax_interceptor_.settings.ajaxInterceptorRules.forEach(
        ({ match, text = "{}", path }) => {
          if (match && response.url.indexOf(match) > -1) {
            window.dispatchEvent(
              new CustomEvent("ajaxIntercepted", {
                detail: { url: response.url, match },
              })
            );
            txt = text;
            let origText = response.text();
            if (path) {
              // 如果需要部分替换
              try {
                let res = JSON.parse(origText);
                let pathArr = path.split(".");
                let lastPath = pathArr.pop();
                let tar = res;
                for (let i = 0; i < pathArr.length; i++) {
                  tar = tar[pathArr[i]];
                }
                tar[lastPath] = JSON.parse(text);
                txt = JSON.stringify(res);
              } catch (error) {}
            }
          }
        }
      );

      if (txt !== undefined) {
        const stream = new ReadableStream({
          start(controller) {
            const bufView = new Uint8Array(new ArrayBuffer(txt.length));
            for (var i = 0; i < txt.length; i++) {
              bufView[i] = txt.charCodeAt(i);
            }

            controller.enqueue(bufView);
            controller.close();
          },
        });

        const newResponse = new Response(stream, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
        const proxy = new Proxy(newResponse, {
          get: function (target, name) {
            switch (name) {
              case "ok":
              case "redirected":
              case "type":
              case "url":
              case "useFinalURL":
              case "body":
              case "bodyUsed":
                return response[name];
            }
            return target[name];
          },
        });

        for (let key in proxy) {
          if (typeof proxy[key] === "function") {
            proxy[key] = proxy[key].bind(newResponse);
          }
        }

        return proxy;
      } else {
        return response;
      }
    });
  },
};

if (localStorage.getItem("ajax_interceptor") > 0) {
  console.log("********开始拦截*******");
  window.XMLHttpRequest = _ajax_interceptor_.myXHR;
  window.fetch = _ajax_interceptor_.myFetch;
  try {
    _ajax_interceptor_.settings.ajaxInterceptorRules = JSON.parse(
      localStorage.getItem("ajax_interceptor_rules")
    )
      .filter((item) => !item.closed)
      .map((item) => {
        item.text = "{}";
        if (typeof item.text === "object") {
          item.text = JSON.stringify(item.text);
        }
        return item;
      });
  } catch (error) {
    if (localStorage.getItem("ajax_interceptor_rules")) {
      console.warn("ajax_interceptor_rules 格式不对");
    }
  }
} else {
  // window.XMLHttpRequest = _ajax_interceptor_.originalXHR;
  // window.fetch = _ajax_interceptor_.originalFetch;
}
