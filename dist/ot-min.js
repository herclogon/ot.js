/*
 *    /\
 *   /  \ ot 0.0.13
 *  /    \ http://operational-transformation.github.com
 *  \    /
 *   \  / (c) 2012-2014 Tim Baumann <tim@timbaumann.info> (http://timbaumann.info)
 *    \/ ot may be freely distributed under the MIT license.
 */

if("undefined"==typeof ot)var ot={};if(ot.TextOperation=function(){"use strict";function a(){return this&&this.constructor===a?(this.ops=[],this.baseLength=0,void(this.targetLength=0)):new a}function b(b){var c=b.ops,d=a.isRetain;switch(c.length){case 1:return c[0];case 2:return d(c[0])?c[1]:d(c[1])?c[0]:null;case 3:if(d(c[0])&&d(c[2]))return c[1]}return null}function c(a){return d(a.ops[0])?a.ops[0]:0}a.prototype.equals=function(a){if(this.baseLength!==a.baseLength)return!1;if(this.targetLength!==a.targetLength)return!1;if(this.ops.length!==a.ops.length)return!1;for(var b=0;b<this.ops.length;b++)if(this.ops[b]!==a.ops[b])return!1;return!0};var d=a.isRetain=function(a){return"number"==typeof a&&a>0},e=a.isInsert=function(a){return"string"==typeof a},f=a.isDelete=function(a){return"number"==typeof a&&0>a};return a.prototype.retain=function(a){if("number"!=typeof a)throw new Error("retain expects an integer");return 0===a?this:(this.baseLength+=a,this.targetLength+=a,d(this.ops[this.ops.length-1])?this.ops[this.ops.length-1]+=a:this.ops.push(a),this)},a.prototype.insert=function(a){if("string"!=typeof a)throw new Error("insert expects a string");if(""===a)return this;this.targetLength+=a.length;var b=this.ops;return e(b[b.length-1])?b[b.length-1]+=a:f(b[b.length-1])?e(b[b.length-2])?b[b.length-2]+=a:(b[b.length]=b[b.length-1],b[b.length-2]=a):b.push(a),this},a.prototype["delete"]=function(a){if("string"==typeof a&&(a=a.length),"number"!=typeof a)throw new Error("delete expects an integer or a string");return 0===a?this:(a>0&&(a=-a),this.baseLength-=a,f(this.ops[this.ops.length-1])?this.ops[this.ops.length-1]+=a:this.ops.push(a),this)},a.prototype.isNoop=function(){return 0===this.ops.length||1===this.ops.length&&d(this.ops[0])},a.prototype.toString=function(){var a=Array.prototype.map||function(a){for(var b=this,c=[],d=0,e=b.length;e>d;d++)c[d]=a(b[d]);return c};return a.call(this.ops,function(a){return d(a)?"retain "+a:e(a)?"insert '"+a+"'":"delete "+-a}).join(", ")},a.prototype.toJSON=function(){return this.ops},a.fromJSON=function(b){for(var c=new a,g=0,h=b.length;h>g;g++){var i=b[g];if(d(i))c.retain(i);else if(e(i))c.insert(i);else{if(!f(i))throw new Error("unknown operation: "+JSON.stringify(i));c["delete"](i)}}return c},a.prototype.apply=function(a){var b=this;if(a.length!==b.baseLength)throw new Error("The operation's base length must be equal to the string's length.");for(var c=[],f=0,g=0,h=this.ops,i=0,j=h.length;j>i;i++){var k=h[i];if(d(k)){if(g+k>a.length)throw new Error("Operation can't retain more characters than are left in the string.");c[f++]=a.slice(g,g+k),g+=k}else e(k)?c[f++]=k:g-=k}if(g!==a.length)throw new Error("The operation didn't operate on the whole string.");return c.join("")},a.prototype.invert=function(b){for(var c=0,f=new a,g=this.ops,h=0,i=g.length;i>h;h++){var j=g[h];d(j)?(f.retain(j),c+=j):e(j)?f["delete"](j.length):(f.insert(b.slice(c,c-j)),c-=j)}return f},a.prototype.compose=function(b){var c=this;if(c.targetLength!==b.baseLength)throw new Error("The base length of the second operation has to be the target length of the first operation");for(var g=new a,h=c.ops,i=b.ops,j=0,k=0,l=h[j++],m=i[k++];;){if("undefined"==typeof l&&"undefined"==typeof m)break;if(f(l))g["delete"](l),l=h[j++];else if(e(m))g.insert(m),m=i[k++];else{if("undefined"==typeof l)throw new Error("Cannot compose operations: first operation is too short.");if("undefined"==typeof m)throw new Error("Cannot compose operations: first operation is too long.");if(d(l)&&d(m))l>m?(g.retain(m),l-=m,m=i[k++]):l===m?(g.retain(l),l=h[j++],m=i[k++]):(g.retain(l),m-=l,l=h[j++]);else if(e(l)&&f(m))l.length>-m?(l=l.slice(-m),m=i[k++]):l.length===-m?(l=h[j++],m=i[k++]):(m+=l.length,l=h[j++]);else if(e(l)&&d(m))l.length>m?(g.insert(l.slice(0,m)),l=l.slice(m),m=i[k++]):l.length===m?(g.insert(l),l=h[j++],m=i[k++]):(g.insert(l),m-=l.length,l=h[j++]);else{if(!d(l)||!f(m))throw new Error("This shouldn't happen: op1: "+JSON.stringify(l)+", op2: "+JSON.stringify(m));l>-m?(g["delete"](m),l+=m,m=i[k++]):l===-m?(g["delete"](m),l=h[j++],m=i[k++]):(g["delete"](l),m+=l,l=h[j++])}}}return g},a.prototype.shouldBeComposedWith=function(a){if(this.isNoop()||a.isNoop())return!0;var d=c(this),g=c(a),h=b(this),i=b(a);return h&&i?e(h)&&e(i)?d+h.length===g:f(h)&&f(i)?g-i===d||d===g:!1:!1},a.prototype.shouldBeComposedWithInverted=function(a){if(this.isNoop()||a.isNoop())return!0;var d=c(this),g=c(a),h=b(this),i=b(a);return h&&i?e(h)&&e(i)?d+h.length===g||d===g:f(h)&&f(i)?g-i===d:!1:!1},a.transform=function(b,c){if(b.baseLength!==c.baseLength)throw new Error("Both operations have to have the same base length");for(var g=new a,h=new a,i=b.ops,j=c.ops,k=0,l=0,m=i[k++],n=j[l++];;){if("undefined"==typeof m&&"undefined"==typeof n)break;if(e(m))g.insert(m),h.retain(m.length),m=i[k++];else if(e(n))g.retain(n.length),h.insert(n),n=j[l++];else{if("undefined"==typeof m)throw new Error("Cannot compose operations: first operation is too short.");if("undefined"==typeof n)throw new Error("Cannot compose operations: first operation is too long.");var o;if(d(m)&&d(n))m>n?(o=n,m-=n,n=j[l++]):m===n?(o=n,m=i[k++],n=j[l++]):(o=m,n-=m,m=i[k++]),g.retain(o),h.retain(o);else if(f(m)&&f(n))-m>-n?(m-=n,n=j[l++]):m===n?(m=i[k++],n=j[l++]):(n-=m,m=i[k++]);else if(f(m)&&d(n))-m>n?(o=n,m+=n,n=j[l++]):-m===n?(o=n,m=i[k++],n=j[l++]):(o=-m,n+=m,m=i[k++]),g["delete"](o);else{if(!d(m)||!f(n))throw new Error("The two operations aren't compatible");m>-n?(o=-n,m+=n,n=j[l++]):m===-n?(o=m,m=i[k++],n=j[l++]):(o=m,n+=m,m=i[k++]),h["delete"](o)}}}return[g,h]},a}(),"object"==typeof module&&(module.exports=ot.TextOperation),"undefined"==typeof ot)var ot={};if(ot.Cursor=function(a){"use strict";function b(a,b){this.position=a,this.selectionEnd=b}var c=a.ot?a.ot.TextOperation:require("./text-operation");return b.fromJSON=function(a){return new b(a.position,a.selectionEnd)},b.prototype.equals=function(a){return this.position===a.position&&this.selectionEnd===a.selectionEnd},b.prototype.compose=function(a){return a},b.prototype.transform=function(a){function d(b){for(var d=b,e=a.ops,f=0,g=a.ops.length;g>f&&(c.isRetain(e[f])?b-=e[f]:c.isInsert(e[f])?d+=e[f].length:(d-=Math.min(b,-e[f]),b+=e[f]),!(0>b));f++);return d}var e=d(this.position);return this.position===this.selectionEnd?new b(e,e):new b(e,d(this.selectionEnd))},b}(this),"object"==typeof module&&(module.exports=ot.Cursor),"undefined"==typeof ot)var ot={};if(ot.WrappedOperation=function(){"use strict";function a(a,b){this.wrapped=a,this.meta=b}function b(a,b){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])}function c(a,c){if(a&&"object"==typeof a){if("function"==typeof a.compose)return a.compose(c);var d={};return b(a,d),b(c,d),d}return c}function d(a,b){return a&&"object"==typeof a&&"function"==typeof a.transform?a.transform(b):a}return a.prototype.apply=function(){return this.wrapped.apply.apply(this.wrapped,arguments)},a.prototype.invert=function(){var b=this.meta;return new a(this.wrapped.invert.apply(this.wrapped,arguments),b&&"object"==typeof b&&"function"==typeof b.invert?b.invert.apply(b,arguments):b)},a.prototype.compose=function(b){return new a(this.wrapped.compose(b.wrapped),c(this.meta,b.meta))},a.transform=function(b,c){var e=b.wrapped.constructor.transform,f=e(b.wrapped,c.wrapped);return[new a(f[0],d(b.meta,c.wrapped)),new a(f[1],d(c.meta,b.wrapped))]},a}(this),"object"==typeof module&&(module.exports=ot.WrappedOperation),"undefined"==typeof ot)var ot={};if(ot.UndoManager=function(){"use strict";function a(a){this.maxItems=a||50,this.state=c,this.dontCompose=!1,this.undoStack=[],this.redoStack=[]}function b(a,b){for(var c=[],d=b.constructor,e=a.length-1;e>=0;e--){var f=d.transform(a[e],b);"function"==typeof f[0].isNoop&&f[0].isNoop()||c.push(f[0]),b=f[1]}return c.reverse()}var c="normal",d="undoing",e="redoing";return a.prototype.add=function(a,b){if(this.state===d)this.redoStack.push(a),this.dontCompose=!0;else if(this.state===e)this.undoStack.push(a),this.dontCompose=!0;else{var c=this.undoStack;!this.dontCompose&&b&&c.length>0?c.push(a.compose(c.pop())):(c.push(a),c.length>this.maxItems&&c.shift()),this.dontCompose=!1,this.redoStack=[]}},a.prototype.transform=function(a){this.undoStack=b(this.undoStack,a),this.redoStack=b(this.redoStack,a)},a.prototype.performUndo=function(a){if(this.state=d,0===this.undoStack.length)throw new Error("undo not possible");a(this.undoStack.pop()),this.state=c},a.prototype.performRedo=function(a){if(this.state=e,0===this.redoStack.length)throw new Error("redo not possible");a(this.redoStack.pop()),this.state=c},a.prototype.canUndo=function(){return 0!==this.undoStack.length},a.prototype.canRedo=function(){return 0!==this.redoStack.length},a.prototype.isUndoing=function(){return this.state===d},a.prototype.isRedoing=function(){return this.state===e},a}(),"object"==typeof module&&(module.exports=ot.UndoManager),"undefined"==typeof ot)var ot={};ot.Client=function(){"use strict";function a(a){this.revision=a,this.state=e}function b(){}function c(a){this.outstanding=a}function d(a,b){this.outstanding=a,this.buffer=b}a.prototype.setState=function(a){this.state=a},a.prototype.applyClient=function(a){this.setState(this.state.applyClient(this,a))},a.prototype.applyServer=function(a){this.revision++,this.setState(this.state.applyServer(this,a))},a.prototype.serverAck=function(){this.revision++,this.setState(this.state.serverAck(this))},a.prototype.serverReconnect=function(){"function"==typeof this.state.resend&&this.state.resend(this)},a.prototype.transformCursor=function(a){return this.state.transformCursor(a)},a.prototype.sendOperation=function(){throw new Error("sendOperation must be defined in child class")},a.prototype.applyOperation=function(){throw new Error("applyOperation must be defined in child class")},a.Synchronized=b,b.prototype.applyClient=function(a,b){return a.sendOperation(a.revision,b),new c(b)},b.prototype.applyServer=function(a,b){return a.applyOperation(b),this},b.prototype.serverAck=function(){throw new Error("There is no pending operation.")},b.prototype.transformCursor=function(a){return a};var e=new b;return a.AwaitingConfirm=c,c.prototype.applyClient=function(a,b){return new d(this.outstanding,b)},c.prototype.applyServer=function(a,b){var d=b.constructor.transform(this.outstanding,b);return a.applyOperation(d[1]),new c(d[0])},c.prototype.serverAck=function(){return e},c.prototype.transformCursor=function(a){return a.transform(this.outstanding)},c.prototype.resend=function(a){a.sendOperation(a.revision,this.outstanding)},a.AwaitingWithBuffer=d,d.prototype.applyClient=function(a,b){var c=this.buffer.compose(b);return new d(this.outstanding,c)},d.prototype.applyServer=function(a,b){var c=b.constructor.transform,e=c(this.outstanding,b),f=c(this.buffer,e[1]);return a.applyOperation(f[1]),new d(e[0],f[0])},d.prototype.serverAck=function(a){return a.sendOperation(a.revision,this.buffer),new c(this.buffer)},d.prototype.transformCursor=function(a){return a.transform(this.outstanding).transform(this.buffer)},d.prototype.resend=function(a){a.sendOperation(a.revision,this.outstanding)},a}(this),"object"==typeof module&&(module.exports=ot.Client),ot.CodeMirrorAdapter=function(){"use strict";function a(a){this.cm=a,this.ignoreNextChange=!1,f(this,"onChange"),f(this,"onCursorActivity"),f(this,"onFocus"),f(this,"onBlur"),a.on("change",this.onChange),a.on("cursorActivity",this.onCursorActivity),a.on("focus",this.onFocus),a.on("blur",this.onBlur)}function b(a,b){return a.line<b.line?-1:a.line>b.line?1:a.ch<b.ch?-1:a.ch>b.ch?1:0}function c(a,c){return 0===b(a,c)}function d(a,c){return b(a,c)<=0}function e(a){return a.indexFromPos({line:a.lastLine(),ch:0})+a.getLine(a.lastLine()).length}function f(a,b){var c=a[b];a[b]=function(){c.apply(a,arguments)}}var g=ot.TextOperation,h=ot.Cursor;a.prototype.detach=function(){this.cm.off("change",this.onChange),this.cm.off("cursorActivity",this.onCursorActivity),this.cm.off("focus",this.onFocus),this.cm.off("blur",this.onBlur)},a.operationFromCodeMirrorChange=function(a,b){function c(a){return a[a.length-1]}function f(a){if(0===a.length)return 0;for(var b=0,c=0;c<a.length;c++)b+=a[c].length;return b+a.length-1}function h(a,b){return function(e){return d(e,b.from)?a(e):d(b.to,e)?a({line:e.line+b.text.length-1-(b.to.line-b.from.line),ch:b.to.line<e.line?e.ch:b.text.length<=1?e.ch-(b.to.ch-b.from.ch)+f(b.text):e.ch-b.to.ch+c(b.text).length})+f(b.removed)-f(b.text):b.from.line===e.line?a(b.from)+e.ch-b.from.ch:a(b.from)+f(b.removed.slice(0,e.line-b.from.line))+1+e.ch}}for(var i=[],j=0;a;)i[j++]=a,a=a.next;var k=e(b),l=(new g).retain(k),m=(new g).retain(k),n=function(a){return b.indexFromPos(a)};for(j=i.length-1;j>=0;j--){a=i[j],n=h(n,a);var o=n(a.from),p=k-o-f(a.text);l=(new g).retain(o)["delete"](f(a.removed)).insert(a.text.join("\n")).retain(p).compose(l),m=m.compose((new g).retain(o)["delete"](f(a.text)).insert(a.removed.join("\n")).retain(p)),k+=f(a.removed)-f(a.text)}return[l,m]},a.applyOperationToCodeMirror=function(a,b){b.operation(function(){for(var c=a.ops,d=0,e=0,f=c.length;f>e;e++){var h=c[e];if(g.isRetain(h))d+=h;else if(g.isInsert(h))b.replaceRange(h,b.posFromIndex(d)),d+=h.length;else if(g.isDelete(h)){var i=b.posFromIndex(d),j=b.posFromIndex(d-h);b.replaceRange("",i,j)}}})},a.prototype.registerCallbacks=function(a){this.callbacks=a},a.prototype.onChange=function(b,c){if(!this.ignoreNextChange){var d=a.operationFromCodeMirrorChange(c,this.cm);this.trigger("change",d[0],d[1])}this.ignoreNextChange=!1},a.prototype.onCursorActivity=a.prototype.onFocus=function(){this.trigger("cursorActivity")},a.prototype.onBlur=function(){this.cm.somethingSelected()||this.trigger("blur")},a.prototype.getValue=function(){return this.cm.getValue()},a.prototype.getCursor=function(){var a,b=this.cm,d=b.getCursor(),e=b.indexFromPos(d);if(b.somethingSelected()){var f=b.getCursor(!0),g=c(d,f)?b.getCursor(!1):f;a=b.indexFromPos(g)}else a=e;return new h(e,a)},a.prototype.setCursor=function(a){this.cm.setSelection(this.cm.posFromIndex(a.position),this.cm.posFromIndex(a.selectionEnd))};var i=function(){var a={},b=document.createElement("style");document.documentElement.getElementsByTagName("head")[0].appendChild(b);var c=b.sheet;return function(b){a[b]||(a[b]=!0,c.insertRule(b,(c.cssRules||c.rules).length))}}();return a.prototype.setOtherCursor=function(a,b,c){var d=this.cm.posFromIndex(a.position);if(a.position===a.selectionEnd){var e=this.cm.cursorCoords(d),f=document.createElement("pre");return f.className="other-client",f.style.borderLeftWidth="2px",f.style.borderLeftStyle="solid",f.innerHTML="&nbsp;",f.style.borderLeftColor=b,f.style.height=.9*(e.bottom-e.top)+"px",f.style.marginTop=e.top-e.bottom+"px",f.style.zIndex=0,f.setAttribute("data-clientid",c),this.cm.addWidget(d,f,!1),{clear:function(){var a=f.parentNode;a&&a.removeChild(f)}}}var g=/^#([0-9a-fA-F]{6})$/.exec(b);if(!g)throw new Error("only six-digit hex colors are allowed.");var h="selection-"+g[1],j="."+h+" { background: "+b+"; }";i(j);var k,l;return a.selectionEnd>a.position?(k=d,l=this.cm.posFromIndex(a.selectionEnd)):(k=this.cm.posFromIndex(a.selectionEnd),l=d),this.cm.markText(k,l,{className:h})},a.prototype.trigger=function(a){var b=Array.prototype.slice.call(arguments,1),c=this.callbacks&&this.callbacks[a];c&&c.apply(this,b)},a.prototype.applyOperation=function(b){this.ignoreNextChange=!0,a.applyOperationToCodeMirror(b,this.cm)},a.prototype.registerUndo=function(a){this.cm.undo=a},a.prototype.registerRedo=function(a){this.cm.redo=a},a}(),ot.SocketIOAdapter=function(){"use strict";function a(a){this.socket=a;var b=this;a.on("client_left",function(a){b.trigger("client_left",a)}).on("set_name",function(a,c){b.trigger("set_name",a,c)}).on("ack",function(){b.trigger("ack")}).on("operation",function(a,c,d){b.trigger("operation",c),b.trigger("cursor",a,d)}).on("cursor",function(a,c){b.trigger("cursor",a,c)}).on("reconnect",function(){b.trigger("reconnect")})}return a.prototype.sendOperation=function(a,b,c){this.socket.emit("operation",a,b,c)},a.prototype.sendCursor=function(a){this.socket.emit("cursor",a)},a.prototype.registerCallbacks=function(a){this.callbacks=a},a.prototype.trigger=function(a){var b=Array.prototype.slice.call(arguments,1),c=this.callbacks&&this.callbacks[a];c&&c.apply(this,b)},a}(),ot.AjaxAdapter=function(){"use strict";function a(a,b,c){"/"!==a[a.length-1]&&(a+="/"),this.path=a,this.ownUserName=b,this.majorRevision=c.major||0,this.minorRevision=c.minor||0,this.poll()}return a.prototype.renderRevisionPath=function(){return"revision/"+this.majorRevision+"-"+this.minorRevision},a.prototype.handleResponse=function(a){var b,c=a.operations;for(b=0;b<c.length;b++)c[b].user===this.ownUserName?this.trigger("ack"):this.trigger("operation",c[b].operation);c.length>0&&(this.majorRevision+=c.length,this.minorRevision=0);var d=a.events;if(d){for(b=0;b<d.length;b++){var e=d[b].user;if(e!==this.ownUserName)switch(d[b].event){case"joined":this.trigger("set_name",e,e);break;case"left":this.trigger("client_left",e);break;case"cursor":this.trigger("cursor",e,d[b].cursor)}}this.minorRevision+=d.length}var f=a.users;f&&(delete f[this.ownUserName],this.trigger("clients",f)),a.revision&&(this.majorRevision=a.revision.major,this.minorRevision=a.revision.minor)},a.prototype.poll=function(){var a=this;$.ajax({url:this.path+this.renderRevisionPath(),type:"GET",dataType:"json",timeout:5e3,success:function(b){a.handleResponse(b),a.poll()},error:function(){setTimeout(function(){a.poll()},500)}})},a.prototype.sendOperation=function(a,b,c){if(a!==this.majorRevision)throw new Error("Revision numbers out of sync");var d=this;$.ajax({url:this.path+this.renderRevisionPath(),type:"POST",data:JSON.stringify({operation:b,cursor:c}),contentType:"application/json",processData:!1,success:function(){},error:function(){setTimeout(function(){d.sendOperation(a,b,c)},500)}})},a.prototype.sendCursor=function(a){$.ajax({url:this.path+this.renderRevisionPath()+"/cursor",type:"POST",data:JSON.stringify(a),contentType:"application/json",processData:!1,timeout:1e3})},a.prototype.registerCallbacks=function(a){this.callbacks=a},a.prototype.trigger=function(a){var b=Array.prototype.slice.call(arguments,1),c=this.callbacks&&this.callbacks[a];c&&c.apply(this,b)},a}(),ot.EditorClient=function(){"use strict";function a(a,b){this.cursorBefore=a,this.cursorAfter=b}function b(a,b){this.clientId=a,this.cursor=b}function c(a,b,c,d,e){this.id=a,this.listEl=b,this.editorAdapter=c,this.name=d,this.li=document.createElement("li"),d&&(this.li.textContent=d,this.listEl.appendChild(this.li)),this.setColor(d?g(d):Math.random()),e&&this.updateCursor(e)}function d(a,b,c,d){k.call(this,a),this.serverAdapter=c,this.editorAdapter=d,this.undoManager=new m,this.initializeClientList(),this.initializeClients(b);var e=this;this.editorAdapter.registerCallbacks({change:function(a,b){e.onChange(a,b)},cursorActivity:function(){e.onCursorActivity()},blur:function(){e.onBlur()}}),this.editorAdapter.registerUndo(function(){e.undo()}),this.editorAdapter.registerRedo(function(){e.redo()}),this.serverAdapter.registerCallbacks({client_left:function(a){e.onClientLeft(a)},set_name:function(a,b){e.getClientObject(a).setName(b)},ack:function(){e.serverAck()},operation:function(a){e.applyServer(n.fromJSON(a))},cursor:function(a,b){b?e.getClientObject(a).updateCursor(e.transformCursor(l.fromJSON(b))):e.getClientObject(a).removeCursor()},clients:function(a){var b;for(b in e.clients)e.clients.hasOwnProperty(b)&&!a.hasOwnProperty(b)&&e.onClientLeft(b);for(b in a)if(a.hasOwnProperty(b)&&e.clients.hasOwnProperty(b)){var c=a[b];c?e.clients[b].updateCursor(e.transformCursor(l.fromJSON(c))):e.clients[b].removeCursor()}},reconnect:function(){e.serverReconnect()}})}function e(a,b,c){function d(a){var b=Math.round(255*a).toString(16);return 1===b.length?"0"+b:b}return"#"+d(a)+d(b)+d(c)}function f(a,b,c){if(0===b)return e(c,c,c);var d=.5>c?c*(1+b):c+b-b*c,f=2*c-d,g=function(a){return 0>a&&(a+=1),a>1&&(a-=1),1>6*a?f+6*(d-f)*a:1>2*a?d:2>3*a?f+6*(d-f)*(2/3-a):f};return e(g(a+1/3),g(a),g(a-1/3))}function g(a){for(var b=1,c=0;c<a.length;c++)b=17*(b+a.charCodeAt(c))%360;return b/360}function h(a,b){function c(){}c.prototype=b.prototype,a.prototype=new c,a.prototype.constructor=a}function i(a){return a[a.length-1]}function j(a){a.parentNode&&a.parentNode.removeChild(a)}var k=ot.Client,l=ot.Cursor,m=ot.UndoManager,n=ot.TextOperation,o=ot.WrappedOperation;return a.prototype.invert=function(){return new a(this.cursorAfter,this.cursorBefore)},a.prototype.compose=function(b){return new a(this.cursorBefore,b.cursorAfter)},a.prototype.transform=function(b){return new a(this.cursorBefore.transform(b),this.cursorAfter.transform(b))},b.fromJSON=function(a){return new b(a.clientId,a.cursor&&l.fromJSON(a.cursor))},b.prototype.transform=function(a){return new b(this.clientId,this.cursor&&this.cursor.transform(a))},c.prototype.setColor=function(a){this.hue=a,this.color=f(a,.75,.5),this.lightColor=f(a,.5,.9),this.li&&(this.li.style.color=this.color)},c.prototype.setName=function(a){this.name=a,this.li.textContent=a,this.li.parentNode||this.listEl.appendChild(this.li),this.setColor(g(a))},c.prototype.updateCursor=function(a){this.removeCursor(),this.cursor=a,this.mark=this.editorAdapter.setOtherCursor(a,a.position===a.selectionEnd?this.color:this.lightColor,this.id)},c.prototype.remove=function(){this.li&&j(this.li),this.removeCursor()},c.prototype.removeCursor=function(){this.mark&&this.mark.clear()},h(d,k),d.prototype.addClient=function(a,b){this.clients[a]=new c(a,this.clientListEl,this.editorAdapter,b.name||a,b.cursor?l.fromJSON(b.cursor):null)},d.prototype.initializeClients=function(a){this.clients={};for(var b in a)a.hasOwnProperty(b)&&this.addClient(b,a[b])},d.prototype.getClientObject=function(a){var b=this.clients[a];return b?b:this.clients[a]=new c(a,this.clientListEl,this.editorAdapter)},d.prototype.onClientLeft=function(a){console.log("User disconnected: "+a);var b=this.clients[a];b&&(b.remove(),delete this.clients[a])},d.prototype.initializeClientList=function(){this.clientListEl=document.createElement("ul")},d.prototype.applyUnredo=function(a){this.undoManager.add(a.invert(this.editorAdapter.getValue())),this.editorAdapter.applyOperation(a.wrapped),this.cursor=a.meta.cursorAfter,this.editorAdapter.setCursor(this.cursor),this.applyClient(a.wrapped)},d.prototype.undo=function(){var a=this;this.undoManager.canUndo()&&this.undoManager.performUndo(function(b){a.applyUnredo(b)})},d.prototype.redo=function(){var a=this;this.undoManager.canRedo()&&this.undoManager.performRedo(function(b){a.applyUnredo(b)})},d.prototype.onChange=function(b,c){var d=this.cursor;this.updateCursor();var e=new a(d,this.cursor),f=(new o(b,e),this.undoManager.undoStack.length>0&&c.shouldBeComposedWithInverted(i(this.undoManager.undoStack).wrapped)),g=new a(this.cursor,d);this.undoManager.add(new o(c,g),f),this.applyClient(b)},d.prototype.updateCursor=function(){this.cursor=this.editorAdapter.getCursor()},d.prototype.onCursorActivity=function(){var a=this.cursor;this.updateCursor(),a&&this.cursor.equals(a)||this.sendCursor(this.cursor)},d.prototype.onBlur=function(){this.cursor=null,this.sendCursor(null)},d.prototype.sendCursor=function(a){this.state instanceof k.AwaitingWithBuffer||this.serverAdapter.sendCursor(a)},d.prototype.sendOperation=function(a,b){this.serverAdapter.sendOperation(a,b.toJSON(),this.cursor)},d.prototype.applyOperation=function(a){this.editorAdapter.applyOperation(a),this.updateCursor(),this.undoManager.transform(new o(a,null))},d}();