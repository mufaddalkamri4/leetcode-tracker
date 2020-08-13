class Problem {
    constructor(title, url) {
        this.title = title;
        this.url = `https://leetcode.com${url}`;
        this.submissions = [];
    }
    getRecentAcceptedSubmission = () => {
        for (let submission of this.submissions) {
            if (submission.isAccepted()) {
                return submission;
            }
        }
        return null;
    }
}
class Submission {
    constructor(id, lang, status_display, time, title, url) {
        this.title = title;
        this.id = id;
        this.lang = lang;
        this.status_display = status_display;
        this.time = time;
        this.url = `https://leetcode.com${url}`;
    }
    isAccepted = () => {
        return this.status_display == "Accepted";
    }
    static fetchAllSubmissions = (submissions = [], offset = 0, lastkey = "") => {
        return new Promise((resolve, reject) => {
            fetch(`https://leetcode.com/api/submissions/?offset=${offset}&limit=20&lastkey=${lastkey}`, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-newrelic-id": "UAQDVFVRGwEAXVlbBAg=",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://leetcode.com/submissions/",
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            }).then((data) => {
                return data.json();
            }).then((result) => {
                for (let item of result.submissions_dump) {
                    let submission = new Submission(item.id, item.lang, item.status_display, item.time, item.title, item.url);
                    submissions.push(submission);
                }
                if (result.has_next) {
                    setTimeout(function(){
                        resolve(Submission.fetchAllSubmissions(submissions, offset + 20, result.last_key));
                    },2000);
                } else {
                    console.log('All Submissions Fetched');
                    resolve(submissions);
                }
            });
        });
    }
}
class Fetcher {
    constructor () {
        this.problems = new Map();
        this.submissions = [];
        this.allAccepted = [];
        Submission.fetchAllSubmissions().then((result) => {
            for(let item of result){
                let problem = this.problems.get(item.title);
                if(problem == undefined){
                    let newProblem = new Problem(item.title, item.url);
                    newProblem.submissions.push(item);
                    this.problems.set(item.title, newProblem);
                } else {
                    problem.submissions.push(item);
                }
            }
            for(let problem of this.problems.values()){
                let submission = problem.getRecentAcceptedSubmission();
                if(submission != null){
                    this.allAccepted.push({
                        Title: submission.title,
                        URL: submission.url,
                        Time: submission.time,
                        Language: submission.lang,
                        Result: submission.status_display
                    })
                }
            }
            this.submissions = result;
        });
    }
    getAllProblemsAccepted = () => {
        if(this.allAccepted != null)
            console.table(this.allAccepted);
        else
            console.log("Wait for data to fetch, Try after sometime.");
    }
    getAllProblemsAttempted = () => {
        let result = [];
        for(let item of this.problems.values()){
            result.push({
                Title: item.title,
                URL: item.url,
                "Recent Submission": item.submissions[0].status_display,
                "Recent Attempt Time": item.submissions[0].time
            });
        }
        console.table(result);
    }
}
var myData = new Fetcher();