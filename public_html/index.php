<!DOCTYPE html>
<html>
    <head>
        <title>TodoPl.us</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <script src="js/all.js" async defer></script>
        <script src="https://apis.google.com/js/platform.js?onload=loadGoogle" async defer></script>
        <script src="https://kit.fontawesome.com/07dfe92655.js" async></script>
        
        <meta name="dynamicUrl" content="<?php echo htmlspecialchars(getenv('DYNAMIC_URL')); ?>">
        <meta name="google-signin-client_id" content="<?php echo getenv('GOOGLE_LOGIN_CLIENT_ID'); ?>">
        
        <link href="https://fonts.googleapis.com/css?family=Source+Code+Pro:900|Source+Sans+Pro&display=swap" rel="stylesheet">
        <link href="css/style.css" rel="stylesheet">
    </head>
    <body>
        <heading>
            <section>
                <a href="https://todopl.us">TodoPl.us</a>
                <a href="https://github.com/maxpelic/todo"><i class="fab fa-github"></i></a>
                <a href="/donate"><i class="fa fas fa-hand-holding-usd"></i></a>
            </section>
            <section>
                <a id="editJobs">edit jobs <i class="fas fa-briefcase"></i></a>
                <a id="logoutLink" href="<?php echo getenv('DYNAMIC_URL'); ?>/logout.php" title="Sign out">sign out <i class="fas fa-sign-out-alt"></i></a>
            </section>
        </heading>
        <main>
            <article>
                <a id="addItem" class="circleButton floatRight"><i class="fas fa-plus"></i></a>
                <h1 class="textLarge noselect">todo</h1>
                <section>
                    <section hidden>
                        <select name="jobId" id="todoJob">
                            <option selected>all jobs</option>
                        </select>
                        <a id="toggleCompleted">view completed</a>
                    </section>
                    <section>
                        <ol id="items" class="list">
                        </ol>
                    </section>
                </section>
            </article>
            
            <article>
                <a id="addEntry" class="circleButton floatRight"><i class="fas fa-plus"></i></a>
                <section class="circleBack">
                    <section class="overlay">
                        <h1 class="textLarge noselect">hours</h1>
                        <section class="fitCircle noselect">
                            <a id="lastJob"><i class="fas fa-caret-left"></i> </a>
                            <span id="jobTitle">loading</span>
                            <a id="nextJob"> <i class="fas fa-caret-right"></i></a>
                        </section>
                        <section>
                            <h3 class="textLarge" id="countdown"><span>0</span><span>0</span>:<span>0</span><span>0</span>:<span>0</span><span>0</span></h3>
                            <section class="buttonContainer">
                                <a class="circleButton" id="toggleStopwatch"><i class="fas fa-play"></i></a>
                                <a class="circleButton" id="logEntry"><i class="fas fa-save"></i></a>
                                <a class="bad circleButton" id="clearStopwatch"><i class="fas fa-times"></i></a>
                            </section>
                            <pre contenteditable="true" id="entryNote"></pre>
                            <ol id="entries" class="list">
                            </ol>
                        </section>
                    </section>
                </section>
            </article>
        </main>
        
        <section id="logoutNotice" class="popup">
            <section>
                <h1 class="textLarge">you've been<br>signed out.</h1>
                <section class="textSpace green">
                    <a href="/login.php">sign back in</a>
                </section>
            </section>
        </section>
        
        <section id="jobList" class="popup">
            <form autocomplete="off">
                <h1 class="textLarge">edit jobs</h1>
                <span id="existingJobs"></span><br>
                <b>new job:</b><br><br>
                <input hidden name="jobId[]" value="">
                <label><span>title:</span> <input type="text" name="title[]"></label><label><span>hourly rate:</span> <input type="number" value=0 name="hourlyRate[]"></label>
                <section class="buttonArea">
                    <button id="jobPopupClose" type="button" class="bad">close</button>
                    <button type="submit" class="good">save</button>
                </section>
            </form>
        </section>
        
        <section id="newItem" class="popup">
            <form autocomplete="off">
                <input hidden name="itemId" value="">
                <h1 class="textLarge">new item</h1>
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
                    <select name="jobId">
                        <option>none</option> 
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
                <section class="buttonArea">
                    <button type="reset"  class="bad">cancel</button><button type="submit" class="good">save</button>
                </section>
            </form>
        </section>
        
        <section id="newEntry" class="popup">
            <form autocomplete="off">
                <input hidden name="entryId" value="">
                <h1 class="textLarge">new entry</h1>
                <label><span>length: </span><input type="number" name="length" placeholder="length (in minutes)" required></label>
                <label><span>description:</span> <input type="text" name="description" placeholder="description"></label>
                <label><span>date started:</span><input type="date" name="clockedIn" value="" required></label>
                <label><span>job:</span>
                    <select name="jobId">
                        <option selected>none</option> 
                    </select>                
                </label>
                <section class="buttonArea">
                    <button type="reset" class="bad">cancel</button>
                    <button type="button" id="archiveButton" class="bad">archive</button>
                    <button type="submit" class="good">save</button>
                </section>
            </form>
        </section>
        
        <section class="popupMenu" id="checklistMenu">
            <ul>
                <li name="edit">edit <i class="fas fa-edit"></i></li>
                <li value=0>no progress</li>
                <li value=1 class="bad">started</li>
                <li value=2 class="good">waiting</li>
                <li value=3>complete</li>
            </ul>
        </section>
        
        <section id="loadingCover">
            <div><span></span><span></span><span></span><p>Loading...</p></div>
        </section>
    </body>
</html>