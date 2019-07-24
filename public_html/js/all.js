/* eslint-env es6 */
/* global window,document,gapi,HTMLElement,Event,XMLHttpRequest,URLSearchParams,FormData */
const googleLoadEvent = new Event('googleLoad');
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
        if(typeof data === 'string') this.request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
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
    
    /** jobs **/
    const jobsLoaded = new Event('jobsLoad'), jobForm = query('#jobList form'), existingJobs = query('#existingJobs'),
          
    //get all jobs
    loadJobs = ()=>{
        
         return new Promise(resolve=>{
             new ajaxRequest(dynamicUrl + '/getJobs.php').get().then((r,s)=>{
                 if(s === 401) return logUserOut();
                 resolve(JSON.parse(r));
             });
         });
    },
          
    //clear jobs from lists
    clearJobs = ()=>{
        const jobElements = document.querySelectorAll('select[name=jobId]');
        
        for(const select of jobElements){
            const toDelete = select.querySelectorAll('option[value]');
            
            for(let elementToDelete of toDelete){
                select.removeChild(elementToDelete);
            }
        }
        
        //remove options from form
        existingJobs.innerHTML = '';
    },
          
    //add job to list
    addJob = job=>{
        
        const jobElements = document.querySelectorAll('select[name=jobId]');
        
        for(const select of jobElements){
            
            const option = element('option');
            option.value = job.jobId;
            option.textContent = job.title;
            
            select.append(option);
        }
        
        const jobId = element('input'), titleLabel = element('label'), title = element('input'), hourlyRateLabel = element('label'), hourlyRate = element('input');
        
        jobId.setAttribute('hidden', 'hidden');
        jobId.value = job.jobId;
        jobId.name = 'jobId[]';
        
        titleLabel.innerHTML = '<span>title: </span>';
        title.value=job.title;
        title.name = 'title[]';
        titleLabel.append(title);
        
        hourlyRateLabel.innerHTML = '<span>hourly rate:</span>';
        hourlyRate.setAttribute('type', 'number');
        hourlyRate.value = job.hourlyRate;
        hourlyRate.name = 'hourlyRate[]';
        hourlyRateLabel.append(hourlyRate);
        
        existingJobs.append(jobId);
        existingJobs.append(titleLabel);
        existingJobs.append(hourlyRateLabel);
    },
          
    //save changes
    updateJobs = ()=>{
        
        window.dispatchEvent(jobsLoaded);
        
        jobForm.parentElement.style.display = '';
        
        return new Promise(resolve=>{
            new ajaxRequest(dynamicUrl + '/editJobs.php').post(new FormData(jobForm)).then((r,s)=>{
                if(s === 401) return logUserOut();
                 resolve(JSON.parse(r));
            }); 
        });       
    },
          
    //add all jobs
    addAllJobs = jobs=>{
        
        clearJobs();
        
        for(const job of jobs){
            addJob(job);
        }
    };
    
    //edit jobs button
    query('#editJobs').c(e=>{
        e.preventDefault();
        
        jobForm.parentElement.style.display = 'flex';
    });
    
    loadJobs().then(addAllJobs);
    
    jobForm.addEventListener('submit', e=>{
        
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        jobForm.parentElement.style.display = 'none';
        
        updateJobs().then(addAllJobs);
    });
    
    jobForm.addEventListener('reset', ()=>{
        
        jobForm.parentElement.style.display = 'none';
    });
    
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
        
        //add all items to the list (calls addItem for each item)
        addAll = (items)=>{
            
            for(const item of items){
                addItem(item);
            }
        },
              
        //clear all items on the list
        clearItems = ()=>
            void (todoArea.innerHTML = ''),
              
        //fetch all incomplete items and return a promise
        loadIncomplete = ()=>{        
            
            return new Promise(resolve=>{
                new ajaxRequest(dynamicUrl + '/getIncompleteItems.php').get().then((r,s)=>{
                    if(s === 401) return logUserOut();
                    resolve(JSON.parse(r));
                });
            });
        },
              
        //get dynamic sort property of an item
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
              
        //sort list of items based on their dynamic properties, return sorted list
        sortItems = items=>{
            
            items = items.filter(item=>item.status < 3);
            for(const item of items){
                getDynamicPriority(item);
            }
            items.sort((a,b)=>b.dynamicPriority - a.dynamicPriority);
            return items;
        },
              
        //get priority color
        getPriorityColor = (priority)=>
            '#' + Math.floor(150 * (priority+1) / 9).toString(16).padStart(2, '0') + Math.floor(150 * (9-priority) / 9).toString(16).padStart(2, '0') + '00',
              
        //search items for an item id and replace it with a new item
        replaceItem = (item,items)=>{
            
            let newArray = items.filter(i=>i.itemId !== item.itemId);
            newArray.push(item);
            return newArray;
        }, 
              
        //show item editing form
        editItem = data=>{
            
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
        
        //load current items
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
        
        //load popup menu
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
        
        const timers = [], timerElement = query('#countdown'), toggleButton = query('#toggleStopwatch'), entryForm = query('#newEntry form'), 
        
        //draw the timer (fired every frame when the timer is running)
        drawTimer = ()=>{
            
            const currentTimer = timers[currentJob];
            
            if(!currentTimer) return;
            
            const result = getLength(currentTimer);
            
            //display time
            timerElement.innerHTML = `<span>${result.hours.toString().padStart(2, '0').split('').join('</span><span>')}</span>:<span>${result.minutes.toString().padStart(2, '0').split('').join('</span><span>')}</span>:<span>${result.seconds.toString().padStart(2, '0').split('').join('</span><span>')}</span>`;
            
            if(currentTimer.running) window.requestAnimationFrame(drawTimer);
        },
              
        //get timer time run
        getLength = timer=>{
            
            let timeRun = 0;
            for(let i = 0; i < timer.started.length; i++){
                timeRun += (timer.paused[i] || new Date().getTime()) - timer.started[i];
            }
            
            return toParts(timeRun);
        },
              
        //get parts of time (hours, minutes, seconds)
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
              
        //refresh the timer interface, color
        refreshTimer = ()=>{
            
            //start
            if(!timers[currentJob]){
                timerElement.innerHTML = '<span>0</span><span>0</span>:<span>0</span><span>0</span>:<span>0</span><span>0</span>';
                toggleButton.textContent = 'start';
                timerElement.classList.remove('blue');
                return;
            }
            
            //pause
            if(timers[currentJob].running){
                timerElement.classList.add('blue');
                toggleButton.textContent = 'pause';
                return;
            } 
            
            //resume
            timerElement.classList.remove('blue');
            toggleButton.textContent = 'resume';
        },
              
        //toggle timer running
        toggleStartTimer = ()=>{
            
            if(!timers[currentJob]){
                timers[currentJob] = {
                    started:[],
                    paused:[],
                    running:0
                };
            }
            
            timers[currentJob].running = !timers[currentJob].running;     
            
            if(timers[currentJob].running){
                timers[currentJob].started.push(new Date().getTime());
                
                window.localStorage.setItem('timer.' + currentJob, new Date().getTime() - getLength(timers[currentJob]).length);
                
                window.requestAnimationFrame(drawTimer);
            } else {
                timers[currentJob].paused.push(new Date().getTime());                
                
                window.localStorage.setItem('timer.' + currentJob, new Date().getTime() - getLength(timers[currentJob]).length+ '_paused_' + new Date().getTime());
            }
            
            refreshTimer();
            
            return timers[currentJob].running;
        },
              
        //reset current timer to 0
        resetTimer = ()=>{
            
            window.localStorage.removeItem('timer.' + currentJob);
            document.title = 'Todo Plus';
            timers[currentJob] = false;
            refreshTimer();
        },
        
        //save current timer and reset
        saveTimer = ()=>{
            
            const note = query('#entryNote').textContent;
            
            new ajaxRequest(dynamicUrl + '/editEntry.php').post('clockedIn=' + timers[currentJob].started[0].toGMTString() + '&jobId=' + currentJob + '&length=' + getLength(timers[currentJob]).length + '&description=' + note).then((r,s)=>{
                if(s === 401) return logUserOut();
                if(s !== 200) return;
                
                query('#entryNote').textContent = '';
                
                resetTimer();
                
                addAll(JSON.parse(r));
            });
        },
              
        //load entries for a job
        loadEntries = job=>{
            
            return new Promise(resolve=>{
                new ajaxRequest(dynamicUrl + '/getEntries.php?jobId=' + job).get().then((r,s)=>{
                    if(s === 401) return logUserOut();
                    if(s !== 200) return;
                    resolve(JSON.parse(r));
                });
            });
        },
        
        //add all entries to the list
        addAll = entries=>{
            
            currentEntries = entries.concat(currentEntries);
            for(const entry of entries){
                addEntry(entry);
            }
        },
              
        //add an entry to the list
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
              
        //load timer from storage (if timer is saved)
        loadFromStorage = job=>{
            
            if(!window.localStorage.getItem('timer.' + job)) return;
            
            const data = window.localStorage.getItem('timer.' + job).split('_');
            
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
                refreshTimer();
                window.requestAnimationFrame(drawTimer);
            }
        },
        
        //clear all entries
        clearEntries = ()=>{
            
            query('#entries').innerHTML = '';
        },
              
        //update document title with timer
        updateTitle = ()=>{
            
            if(timers[currentJob]){
                const parts = getLength(timers[currentJob]);
                document.title = 'Todo Plus - ' + parts.hours.toString().padStart(2, '0') + ':' + parts.minutes.toString().padStart(2, '0') + ':' + parts.seconds.toString().padStart(2, '0');
                return;
            }
            
            document.title = 'Todo Plus';
        },
              
        //replace entry
        replaceEntry = (entry, entries)=>{
            
            entries = entries.filter(e=>e.entryId !== entry.entryId);
            entries.push(entry);
            
            return sortEntries(entry);
        }, 
              
        //sort entries
        sortEntries = entries=>{
            
            entries.sort((a,b)=>new Date(a.clockedIn) - new Date(b.clockedIn));
            return entries;
        };
        
        //update title of page while not in focus
        let titleInterval = 0;
        window.addEventListener('blur', ()=>{
            if(!timers[currentJob]) return;
            titleInterval = window.setInterval(updateTitle, 1000);
            updateTitle();
        });
        window.addEventListener('focus', ()=>{
            window.clearInterval(titleInterval);
            document.title = 'Todo Plus';
        });
        
        //set up timer
        let currentJob = window.localStorage.getItem('currentJob') || 'none';
        
        loadFromStorage(currentJob);
        
        toggleButton.c(toggleStartTimer);
        query('#logEntry').c(saveTimer);
        query('#clearStopwatch').c(resetTimer);
        
        let currentEntries = [];
        loadEntries(currentJob).then(entries=>{
            addAll(entries);
        });
        
        //add / edit
        query('#addEntry').c(()=>{
            
            entryForm.reset();
            entryForm.parentElement.style.display = 'flex';
        });
        
        entryForm.addEventListener('reset', ()=>{
            entryForm.parentElement.style.display = '';
        });
        
        entryForm.addEventListener('submit', e=>{
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
            entryForm.parentElement.style.display = 'none';
            const data = new URLSearchParams(new FormData(entryForm)).toString();
            new ajaxRequest(dynamicUrl + '/editEntry.php').post(data).then((r,s)=>{
                if(s===401) return logUserOut();
                r = JSON.parse(r);
                for(const entry of r){
                    currentEntries = replaceEntry(entry, currentEntries);
                }
                clearEntries();
                addAll(currentEntries);
            });
            return false;
        });
    })();
    
})();
