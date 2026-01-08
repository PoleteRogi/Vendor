const express = require('express');
const router = express.Router();
const dawgdb = require('dawg-db');

const analyticsDB = new dawgdb.Database('analytics');

// SESSION CONFIG
const SESSION_TIMEOUT = 1000 * 60 * 5; // 5 minutes

// SESSION MIDDLEWARE
router.use((req, res, next) => {
    if (!req.session) {
        console.warn('⚠️ analytics: req.session is undefined');
        return next();
    }

    const now = Date.now();

    // INIT SESSION
    if (!req.session.startedAt) {
        req.session.startedAt = now;
        req.session.pages = [];
        req.session.lastActivity = now;
        return next();
    }

    // CHECK INACTIVITY BEFORE UPDATING lastActivity
    const inactiveFor = now - req.session.lastActivity;
    if (inactiveFor > SESSION_TIMEOUT) {
        const sessionData = {
            id: req.session.id,
            startedAt: req.session.startedAt,
            endedAt: req.session.lastActivity,
            duration: req.session.lastActivity - req.session.startedAt,
            pages: req.session.pages,
            abandoned: true,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        };

        analyticsDB.add(sessionData);

        req.session.destroy(() => {});
        return next();
    }

    // TRACK PAGE VIEWS
    if (
        req.method === 'GET' &&
        !req.path.startsWith('/api') &&
        !req.path.startsWith('/_') &&
        !req.path.includes('.')
    ) {
        req.session.pages.push({
            path: req.path,
            time: now
        });
    }

    // UPDATE ACTIVITY
    req.session.lastActivity = now;

    next();
});

// MANUAL SESSION ENDPOINT
router.get('/_end-session', (req, res) => {
    if (!req.session || !req.session.startedAt) {
        return res.sendStatus(204);
    }

    const now = Date.now();

    const sessionData = {
        id: req.session.id,
        startedAt: req.session.startedAt,
        endedAt: now,
        duration: now - req.session.startedAt,
        pages: req.session.pages,
        abandoned: false,
        userAgent: req.headers['user-agent'],
        ip: req.ip
    };

    analyticsDB.add(sessionData);

    req.session.destroy(() => res.sendStatus(204));
});

router.post('/_ping-session', (req, res) => {
    if (!req.session) return res.sendStatus(204);
    req.session.lastActivity = Date.now();
    res.sendStatus(204);
});

setInterval(() => {
    const now = Date.now();
    analyticsDB.get().forEach(session => {
        if (!session.endedAt && now - session.lastActivity > SESSION_TIMEOUT) {
            session.endedAt = session.lastActivity;
            session.duration = session.endedAt - session.startedAt;
            session.abandoned = true;
            analyticsDB.add(session);
        }
    });
}, 10000); // run every 10s

// SESSION DATA LIST
router.get('/_sessions', (req, res) => {
    res.json(analyticsDB.get());
});

// EXPORT
module.exports = {
    router,
    db: analyticsDB
};
