/* eslint-env es6 */
/* global window,document,gapi,HTMLElement,Event,XMLHttpRequest,URLSearchParams,FormData */
let googleLoadEvent = new Event('googleLoad');
// eslint-disable-next-line
function loadGoogle(){
    gapi.load('auth2', function() {
        gapi.auth2.init();
        window.dispatchEvent(googleLoadEvent);
    });
}
(()=>{
    /** tools to make my life easier **/
    const query = q=>document.querySelector(q), dynamicUrl = query('meta[name=dynamicUrl]').getAttribute('content'), element = (t) => document.createElement(t), formatDate = date=>{
        date = new Date(date);
        const today = new Date(), difference = Math.ceil((date.getTime() - today.getTime())/(24*60*60*1000));
        let text = '';
        if(difference === 0){
            text = 'today';
        } else if(difference === 1){
            text = 'tomorrow';
        } else if(difference === -1){
            text = 'yesterday';
        } else if(Math.abs(difference) < 365){
            text = date.toLocaleString('default', {
                month:'short',
                day:'numeric'
            });
        } else {
            text = date.toLocaleString('default', {
                month:'short',
                day:'numeric',
                year:'2-digit'
            });
        }
        return {
            integer:difference,
            text:text
        };            
    };
    HTMLElement.prototype.c = function(f){
        this.addEventListener('click', f);
    };
    HTMLElement.prototype.hasParent = function(parent){
        if(this.parentElement)
            return this.parentElement === parent || this.parentElement.hasParent(parent);
    };
    /** ajax requests **/
    function ajaxRequest(url){
        this.request = new XMLHttpRequest();
        this.url = url;
        return this;
    }
    ajaxRequest.prototype.post = function(data){
        this.request.open('POST', this.url, true);
        this.request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        this.request.send(data);
        return this;
    };
    ajaxRequest.prototype.get = function(){
        this.request.open('GET', this.url, true);
        this.request.send();
        return this;
    };
    ajaxRequest.prototype.then = function(f){
        this.request.onloadend = function(){f.apply(this, [this.response, this.status])};
    };
    
    //logout function
    const logUserOut = ()=>{
        let completed = 0;
        const redirect = ()=>{
            if(++completed < 2) return;
            query('#logoutNotice').style.display = 'flex';
        }, logOutGoogle = ()=>{
            const instance = gapi.auth2.getAuthInstance();
            if(instance.isSignedIn.Ab) instance.signOut().then(redirect);
            else redirect();
        };
        new ajaxRequest(dynamicUrl + '/logout.php').get().then((r, s)=>{
            if(s === 200){
                //logged out
                redirect();
            } else {
                //delete cookie and redirect
                document.cookie = 'heyo=null; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                redirect();
            }
        });

        //google log out
        if(window.gapi && gapi.auth2) logOutGoogle();
        else window.addEventListener('googleLoad', logOutGoogle);
    };
    
    /** sign in/out **/
    (()=>{
        query('#logoutLink').c(e=>{
            logUserOut();
            e.preventDefault();
            return false;
        });
    })();
    
    /** todo list **/
    (()=>{
        const todoArea = query('#items'), popupMenu = query('#checklistMenu');
        let priorities = [];
        //add item to list
        const addItem = data=>{
            const item = element('li'), titleRow = element('p'), title = element('span'), priority = element('span'), infoRow = element('p'), due = element('span'), job = element('span'), description = element('p');
            
            title.textContent = data.title;
            title.style.color = getPriorityColor(data.priority);
            priority.textContent = priorities[data.priority];
            
            titleRow.append(title);
            titleRow.append(priority);
            item.append(titleRow);
            
            description.textContent = data.description;
            item.append(description);
            
            if(data.due){
                const dueDate = formatDate(data.due);
                due.textContent = dueDate.text;
                if(dueDate.integer < 0){
                    due.classList.add('red');
                } else if(!dueDate.integer){
                    due.classList.add('orange');
                } else {
                    due.classList.add('green');
                }
            }
            
            job.textContent = data.job;
            
            infoRow.append(due);
            infoRow.append(job);
            item.append(infoRow);
            
            item.data = data;
            
            item.classList.add('status' + data.status);
            
            item.c(function(e){
                popupMenu.style.top = e.clientY + 'px';
                popupMenu.style.left = e.clientX + 'px';
                popupMenu.classList.add('show');
                popupMenu.targetItem = this.data;
            });

            todoArea.append(item);
        }, 
        addAll = (items)=>{
            for(const item of items){
                addItem(item);
            }
        },
        clearItems = ()=>todoArea.innerHTML = '', 
        loadIncomplete = ()=>{        
            //load todos
            return new Promise(resolve=>{
                new ajaxRequest(dynamicUrl + '/getIncompleteItems.php').get().then((r,s)=>{
                    if(s === 401) return logUserOut();
                    resolve(JSON.parse(r));
                });
            });
        },
        getDynamicPriority = item=>{
            let priority = 0;
            if(item.due){
                const difference = formatDate(item.due).integer;
                if(difference < 0){
                    //overdue
                    priority += 100 - difference;
                } else if(difference < 1){
                    //due today
                    priority += 50 - difference;
                } else {
                    priority -= difference;
                }
            }
            if(item.status === 1) priority += 20;
            if(item.status === 2) priority -= 100;
            
            //magic number
            priority += item.priority * 16; // ?
            item.dynamicPriority = priority;
        },
        sortItems = items=>{
            items = items.filter(item=>item.status < 3);
            for(const item of items){
                getDynamicPriority(item);
            }
            items.sort((a,b)=>b.dynamicPriority - a.dynamicPriority);
            return items;
        },
        getPriorityColor = (priority)=>'#' + Math.floor(150 * (priority+1) / 9).toString(16).padStart(2, '0') + Math.floor(150 * (9-priority) / 9).toString(16).padStart(2, '0') + '00',
        replaceItem = (item,items)=>{
            let newArray = items.filter(i=>i.itemId !== item.itemId);
            newArray.push(item);
            return newArray;
        }, editItem = data=>{
            const dreams = document.querySelectorAll('#newItem form input, #newItem form select'), form = query('#newItem form');
            form.reset();
            for(const field of dreams){
                const value = data[field.getAttribute('name')];
                if(!value) continue;
                field.value = value;
            }
            form.parentElement.style.display = 'flex';
            query('#newItem h1').textContent = 'Edit Item';
        };
        
        //load priority options
        let priorityLabels = document.querySelectorAll('select[name=priority] option');
        for(let i = 0; i < priorityLabels.length; i++){
            priorities.push(priorityLabels[i].textContent);
            priorityLabels[i].style.color = getPriorityColor(i);
        }
        
        let currentItems = [];
        loadIncomplete().then(items=>{
            currentItems = sortItems(items);
            addAll(currentItems);
        });
        
        //new item
        query('#addItem').c(()=>{
            query('#newItem [name=itemId]').value = '';
            query('#newItem form').reset();
            query('#newItem').style.display = 'flex';
            query('#newItem h1').textContent = 'Add an Item';
        });
        
        //item form (new and edited)
        query('#newItem form').addEventListener('submit', function(e){
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
            this.parentElement.style.display = 'none';
            const data = new URLSearchParams(new FormData(this)).toString();
            new ajaxRequest(dynamicUrl + '/editItem.php').post(data).then((r,s)=>{
                if(s===401) return logUserOut();
                r = JSON.parse(r);
                for(const item of r){
                    currentItems = replaceItem(item, currentItems);
                }
                clearItems();
                currentItems = sortItems(currentItems);
                addAll(currentItems);
            });
            return false;
        });
        query('#newItem form').addEventListener('reset', function(){
            this.parentElement.style.display = 'none';
        });
        
        document.body.c(e=>{
            if(!e.target.hasParent(todoArea))
                popupMenu.classList.remove('show');
        });
        
        for(const option of popupMenu.querySelectorAll('li')){
            if(option.getAttribute('name') === 'edit'){
                option.c(()=>{
                    editItem(popupMenu.targetItem);
                    popupMenu.classList.remove('show');
                });
                continue;
            }
            
            option.c(function(){

                new ajaxRequest(dynamicUrl + '/editItem.php').post('itemId=' + popupMenu.targetItem.itemId + '&status=' + this.value).then((r,s)=>{
                    if(s===401) return logUserOut();
                    r = JSON.parse(r);
                    for(const item of r){
                        currentItems = replaceItem(item, currentItems);
                    }
                    clearItems();
                    currentItems = sortItems(currentItems);
                    addAll(currentItems);
                    popupMenu.classList.remove('show');
                });
            });
        }
    })();
    
    /** hours **/
    (()=>{
        const timers = [], timerElement = query('#countdown'), toggleButton = query('#toggleStopwatch'),
        drawTimer = ()=>{
            const currentTimer = timers[currentJob];
            
            if(!currentTimer) return;
            
            const result = getLength(currentTimer);
            
            //display time
            timerElement.innerHTML = `<span>${result.hours.toString().padStart(2, '0').split('').join('</span><span>')}</span>:<span>${result.minutes.toString().padStart(2, '0').split('').join('</span><span>')}</span>:<span>${result.seconds.toString().padStart(2, '0').split('').join('</span><span>')}</span>`;
            
            if(currentTimer.running) window.requestAnimationFrame(drawTimer);
            
        },
        getLength = timer=>{
            let timeRun = 0;
            for(let i = 0; i < timer.started.length; i++){
                timeRun += (timer.paused[i] || new Date().getTime()) - timer.started[i];
            }
            
            return toParts(timeRun);
        },
        toParts = timeRun=>{
            const length = timeRun;
            
            timeRun = Math.floor(timeRun / 1000);
            const seconds = (timeRun % 60);
            
            timeRun = Math.floor(timeRun / 60);
            const minutes = (timeRun % 60);
            
            timeRun = Math.floor(timeRun / 60);
            const hours = (timeRun);
            
            return {
                length:length,
                hours:hours,
                minutes:minutes,
                seconds:seconds
            };
        },
        toggleStartTimer = ()=>{
            if(!timers[currentJob]){
                timers[currentJob] = {
                    started:[],
                    paused:[],
                    running:0
                };
            }
            
            toggleButton.textContent = timerElement.classList.toggle('blue') ? 'pause' : 'start';
            
            if(!timers[currentJob].running){
                timers[currentJob].started.push(new Date().getTime());
                window.requestAnimationFrame(drawTimer);
                
                
                window.localStorage.setItem('timer.' + currentJob, new Date().getTime() - getLength(timers[currentJob]).length);
            } else {
                timers[currentJob].paused.push(new Date().getTime());
                
                
                window.localStorage.setItem('timer.' + currentJob, new Date().getTime() - getLength(timers[currentJob]).length+ '_paused_' + new Date().getTime());
            }
            timers[currentJob].running = !timers[currentJob].running;            
            
            return timers[currentJob].running;
        },
        resetTimer = ()=>{
            timers[currentJob] = false;
            timerElement.innerHTML = '<span>0</span><span>0</span>:<span>0</span><span>0</span>:<span>0</span><span>0</span>';
            toggleButton.textContent = 'start';
            timerElement.classList.remove('blue');
        },
        saveTimer = ()=>{
            //todo
            const note = query('#entryNote').textContent;
            
            new ajaxRequest(dynamicUrl + '/editEntry.php').post('clockedIn=' + timers[currentJob].started[0] + '&jobId=' + currentJob + '&length=' + getLength(timers[currentJob]).length + '&description=' + note).then((r,s)=>{
                if(s === 401) return logUserOut();
                if(s !== 200) return;
                
                query('#entryNote').textContent = '';
                
                resetTimer();
                
                addAll(JSON.parse(r));
            });
        },
        loadEntries = ()=>{
            return new Promise(resolve=>{
                new ajaxRequest(dynamicUrl + '/getEntries.php?jobId=' + currentJob).get().then((r,s)=>{
                    if(s === 401) return logUserOut();
                    if(s !== 200) return;
                    resolve(JSON.parse(r));
                });
            });
        },
        addAll = entries=>{
            currentEntries = entries.concat(currentEntries);
            for(const entry of entries){
                addEntry(entry);
            }
        },
        addEntry = entry=>{
            const item = element('li'), titleRow = element('p'), date = element('span'), hours = element('span'), secondRow = element('p'), description = element('span'), payment = element('span');
            
            date.textContent = formatDate(entry.clockedIn).text;
            const parts = toParts(entry.length);
            hours.textContent = parts.hours + ':' + parts.minutes.toString().padStart(2, '0');
            
            titleRow.append(date);
            titleRow.append(hours);
            
            item.append(titleRow);
            
            description.textContent = entry.description;
            payment.textContent = '$' + (15 * (parts.hours + parts.minutes / 60)).toFixed(2);
            
            secondRow.append(description);
            secondRow.append(payment);
            
            item.append(secondRow);
            
            query('#entries').prepend(item);
        },
        loadFromStorage = job=>{
            const data = window.localStorage.getItem('timer.' + job).split('_');
            
            console.log(data);
            
            timers[job] = {
                started:[],
                paused:[],
                running:1
            };
            timers[job].started.push(new Date(parseInt(data[0])));
            
            if(data.length === 3){
                timers[job].paused.push(new Date(parseInt(data[2])));
                timers[job].running = 0;
            }
            if(job === currentJob){
                timers[job].running ?
                    (timerElement.classList.add('blue'), toggleButton.textContent = 'pause')
                    : (timerElement.classList.remove('blue'), toggleButton.textContent = 'start');
                window.requestAnimationFrame(drawTimer);
            }
            
            console.log(timers);
        };
        let currentJob = 100; //todo
        
        loadFromStorage(currentJob);
        
        toggleButton.c(toggleStartTimer);
        query('#logEntry').c(saveTimer);
        query('#clearStopwatch').c(resetTimer);
        
        let currentEntries = [];
        loadEntries().then(entries=>{
            addAll(entries);
        });
    })();
    
})();
