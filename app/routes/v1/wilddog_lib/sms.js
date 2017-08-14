/**
 * Created by jnduan on 2017/4/19.
 */

var request = require('request'),
    moduleinfo = require('./package.json'),
    Promise = require('bluebird'),
    crypto = require('crypto'),
    querystring = require('querystring'),
    _ = require('lodash')
;

var SMS = function (settings) {
    if (!settings || !(typeof settings === 'object') || !settings.appId || !settings.smsKey) {
        throw new Error('first argument must be an object with appId and smsKey properties.');
    }
    this.appId = settings.appId;
    this.smsKey = settings.smsKey;

    this.API_URL_PREFIX = 'https://api.wilddog.com/sms/v1/';
    this.SEND_CODE_URL_SUFFIX = '/code/send';
    this.CHECK_CODE_URL_SUFFIX = '/code/check';
    this.SEND_NOTIFY_URL_SUFFIX = '/notify/send';
    this.CHECK_STATUS_URL_SUFFIX = '/status';
    this.QUERY_BALANCE_URL_SUFFIX = '/getBalance';

    this.HTTP_DEFAULT_HEADERS = {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'User-Agent': 'wilddog-sms-node/' + moduleinfo.version
    };
};

SMS.prototype.__calcSignature__ = function (form_data) {
    var param_str = decodeURIComponent(querystring.stringify(form_data));
    param_str += '&';
    param_str += this.smsKey;

    return crypto.Hash('sha256').update(param_str).digest('hex');
};

SMS.prototype.__post__ = function (url, form_data, cb) {
    var deferred = Promise.defer();

    request.post({
        url: url,
        headers: this.HTTP_DEFAULT_HEADERS,
        form: form_data
    }, function (err, resp, body) {
        if (err) {
            deferred.reject(err);
        }
        else {
            try {
                var retObj = JSON.parse(body);
                deferred.resolve(retObj);
            }
            catch (e) {
                deferred.reject(e);
            }
        }
    });

    return deferred.promise.nodeify(cb);
};

SMS.prototype.__get__ = function (url, form_data, cb) {
    var deferred = Promise.defer();

    request.get({
        url: url,
        headers: this.HTTP_DEFAULT_HEADERS,
        qs: form_data
    }, function (err, resp, body) {
        if (err) {
            deferred.reject(err);
        }
        else {
            try {
                var retObj = JSON.parse(body);
                deferred.resolve(retObj);
            }
            catch (e) {
                deferred.reject(e);
            }
        }
    });

    return deferred.promise.nodeify(cb);
};

SMS.prototype.sendCode = function (mobile, templateId, params, cb) {

    var form_data = {
        mobile: mobile,
        templateId: templateId,
        timestamp: new Date().getTime()
    };

    if(params !== null && (params instanceof Array)) {
        form_data.params = JSON.stringify(params);
    }

    form_data.signature = this.__calcSignature__(form_data);

    var url = this.API_URL_PREFIX + this.appId + this.SEND_CODE_URL_SUFFIX;

    return this.__post__(url, form_data, cb);
};

SMS.prototype.checkCode = function (mobile, code, cb) {
    var form_data = {
        code: code,
        mobile: mobile,
        timestamp: new Date().getTime()
    };

    form_data.signature = this.__calcSignature__(form_data);

    var url = this.API_URL_PREFIX + this.appId + this.CHECK_CODE_URL_SUFFIX;

    return this.__post__(url, form_data, cb);
};

SMS.prototype.sendNotify = function (mobiles, templateId, params, cb) {

    if(mobiles === null || !(mobiles instanceof Array)) {
        throw new Error('mobiles should be an Array of phone numbers.');
    }

    if(params === null || !(params instanceof Array)) {
        params = [];
    }

    var form_data = {
        mobiles: JSON.stringify(mobiles),
        params: JSON.stringify(params),
        templateId: templateId,
        timestamp: new Date().getTime()
    };

    form_data.signature = this.__calcSignature__(form_data);

    var url = this.API_URL_PREFIX + this.appId + this.SEND_NOTIFY_URL_SUFFIX;

    return this.__post__(url, form_data, cb);
};

SMS.prototype.sendStatus = function (rrid, cb) {
    if(! rrid) {
        throw new Error('rrid can not be null');
    }

    var form_data = {
        rrid: rrid
    };

    form_data.signature = this.__calcSignature__(form_data);

    var url = this.API_URL_PREFIX + this.appId + this.CHECK_STATUS_URL_SUFFIX;

    return this.__get__(url, form_data, cb);
};

SMS.prototype.queryBalance = function (cb) {
    var form_data = {
        timestamp: new Date().getTime()
    };

    form_data.signature = this.__calcSignature__(form_data);

    var url = this.API_URL_PREFIX + this.appId + this.QUERY_BALANCE_URL_SUFFIX;

    return this.__get__(url, form_data, cb);
};

module.exports = SMS;
