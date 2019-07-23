<!DOCTYPE html>
<html>
    <head>
        <title>Todo Plus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <script src="js/all.js" async defer></script>
        <script src="https://apis.google.com/js/platform.js?onload=loadGoogle" async defer></script>
        <script src="https://kit.fontawesome.com/07dfe92655.js" async></script>
        
        <meta name="dynamicUrl" content="<?php echo htmlspecialchars(getenv('DYNAMIC_URL')); ?>">
        <meta name="google-signin-client_id" content="<?php echo getenv('GOOGLE_LOGIN_CLIENT_ID'); ?>">
        
        <link href="https://fonts.googleapis.com/css?family=Merriweather|Fascinate&display=swap" rel="stylesheet">
        <link href="css/all.css" rel="stylesheet">
    </head>
    <body>
        <main>
            <article>
                <h1 class="textLarge noselect">todo</h1>
                <section>
                    <section class="stretchContents noselect">
                        <select id="todoJob">
                            <option selected value="">all jobs</option>
                        </select>
                        <a id="toggleCompleted">view completed</a>
                    </section>
                    <section class="textSpace green noselect">
                        <a id="addItem">add item</a>
                    </section>
                    <section class="fit">
                        <ol id="items" class="list">
                        </ol>
                    </section>
                </section>
            </article>
            <article class="twoPage">
                <h1 class="textLarge noselect">hours</h1>
                <section>
                    <section class="stretchContents noselect">
                        <a id="lastJob">⯇ <span>last job</span></a>
                        <a id="nextJob"><span>next job</span> ⯈</a>
                    </section>
                    <section>
                        <h2 class="textLarge noselect otherFont">job</h2>
                    </section>
                    <section class="shadow"></section>
                    <section class="halfPage centerContent fit fullHeight">
                        <h3 class="textLarge monospace otherFont" id="countdown"><span>0</span><span>0</span>:<span>0</span><span>0</span>:<span>0</span><span>0</span></h3>
                        <section class="stretchContents noselect">
                            <a class="green" id="toggleStopwatch">start</a>
                            <a class="green" id="logEntry">save</a>
                            <a class="red" id="clearStopwatch">clear</a>
                        </section>
                        <pre contenteditable="true" id="entryNote"></pre>
                    </section>
                    <section class="halfPage rightHalf fit">
                        <section class="textSpace green noselect">
                            <a id="addEntry">add entry</a>
                        </section>
                        <ol id="entries" class="list">
                        </ol>
                    </section>
                </section>
            </article>
        </main>
        <heading class="stretchContents">
            <section>
                <a href="/">todo.plus</a>
                <a href="https://github.com/maxpelic/todo"><i class="fab fa-github"></i></a>
                <a href="/donate"><i class="fa fas fa-hand-holding-usd"></i></a>
            </section>
            <section>
                <a id="logoutLink" href="<?php echo getenv('DYNAMIC_URL'); ?>/logout.php" title="Sign out"><i class="fas fa-sign-out-alt"></i> sign out</a>
            </section>
        </heading>
        <section id="logoutNotice" class="popup">
            <section>
                <h1 class="textLarge">you've been<br>signed out.</h1>
                <section class="textSpace green">
                    <a href="/login.php">sign back in</a>
                </section>
            </section>
        </section>
        <section id="newItem" class="popup">
            <form autocomplete="off">
                <input hidden name="itemId" value="">
                <h1 class="textLarge">add an item</h1>
                <label><span>title: </span><input type="text" name="title" placeholder="enter item title" required></label>
                <label><span>description:</span> <input type="text" name="description" placeholder="description"></label>
                <label><span>priority:</span>                    
                    <select name="priority">
                        <option value=0>it's not worth it</option>
                        <option value=1>when I get to it</option>
                        <option value=2>low</option>
                        <option value=3 selected>I should do this</option>
                        <option value=4>medium</option>
                        <option value=5>do it man</option>
                        <option value=6>high</option>
                        <option value=7>you have 5 seconds</option>
                        <option value=8>do it yesterday</option>
                    </select>
                </label>
                <label><span>due date:</span> <input type="date" name="due" value=""></label>
                <label><span>job:</span>
                    <select name="job">
                        <option selected value="">none</option> 
                    </select>                
                </label>
                <label><span>status:</span>
                    <select name="status">
                        <option selected value=0>no progress</option>
                        <option value=1>started</option>
                        <option value=2>waiting</option>
                        <option value=3>complete</option>
                    </select>
                </label>
                <section class="stretchContents">
                    <button type="reset" >cancel</button><button type="submit">save</button>
                </section>
            </form>
        </section>
        <section id="newEntry" class="popup">
            <form autocomplete="off">
                <input hidden name="entryId" value="">
                <h1 class="textLarge">add an entry</h1>
                <label><span>length: </span><input type="number" name="length" placeholder="length (in minutes)" required></label>
                <label><span>description:</span> <input type="text" name="description" placeholder="description"></label>
                <label><span>date started:</span><input type="date" name="clockedIn" value="" required></label>
                <label><span>job:</span>
                    <select name="job">
                        <option selected value="">none</option> 
                    </select>                
                </label>
                <section class="stretchContents">
                    <button type="reset" >cancel</button><button type="submit">save</button>
                </section>
            </form>
        </section>
        <section class="popupMenu" id="checklistMenu">
            <ul>
                <li name="edit" class="textSpace">edit</li>
                <li value=0 class="red">no progress</li>
                <li value=1 class="orange">started</li>
                <li value=2 class="blue">waiting</li>
                <li value=3 class="green">complete</li>
            </ul>
        </section>
    </body>
</html>