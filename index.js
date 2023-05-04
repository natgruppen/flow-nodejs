require('dotenv').config()
const bent = require('bent');

exports.httpCall = async function(authorization, endpoint, method, {objectId = null, data = {}, params = {}}) {
    const headers = {
      'Authorization': 'Basic ' + authorization,
      'Flow-Request-Method': method
    }

    if (Object.keys(params).length !== 0) {
        headers['Flow-Request-Parameter'] = JSON.stringify({"parameters": params})
    }

    if (objectId != null) {
        headers['Flow-Request-ObjectId'] = objectId
    }

    if (endpoint.split('/',1) == "catalogue") {
        path = 'api/product/' + endpoint + '/'
    } else {
        path = 'api/' + endpoint.split('/',1) + '/' + endpoint + '/'
    }

    const flow = bent(process.env.FLOW, 'POST', 'json')

    return await flow(path, data, headers)
}

exports.httpList = async function(authorization, endpoint, {objectId = null, searchItems = null, sortBy = null, sortOrder = "ASC"}) {
    let params = { "condition": "" }

    if (searchItems != null) {
        params['condition'] = true
        params['condition.values'] = []

        for (const [key, value] of Object.entries(searchItems)) {
            params['condition.values'].push({[key]: value})
        }
    }

    if (sortBy != null) {
        params['sorting'] = true
        params['sorting.by'] = sortBy
        params['sorting.order'] = sortOrder
    }

    return await this.httpCall(authorization, endpoint, "LIST", {objectId: objectId, params: params})
}

exports.httpOpen = async function(authorization, endpoint, {objectId = null, data = {}}) {
    return await this.httpCall(authorization, endpoint, "OPEN", {objectId: objectId, data: data})
}

exports.httpCreate = async function(authorization, endpoint, {objectId = null, data = {}}) {
    return await this.httpCall(authorization, endpoint, "CREATE", {objectId: objectId, data: data})
}

exports.httpUpdate = async function(authorization, endpoint, {objectId = null, data = {}}) {
    return await this.httpCall(authorization, endpoint, "UPDATE", {objectId: objectId, data: data})
}

exports.httpDelete = async function(authorization, endpoint, {objectId = null, data = {}}) {
    return await this.httpCall(authorization, endpoint, "DELETE", {objectId: objectId, data: data})
}

exports.login = async function(username,password) {
    const headers = {'Authorization': 'Basic ' + new Buffer.from(username + ':' + password).toString('base64'), 'Flow-Request-Method': "OPEN"}
    const body = {"username": username, "password": password, "clientAddress": '0.0.0.0'}
    const flow = bent(process.env.FLOW, 'POST', 'json', 200)

    try {
	const response = await flow('api/auth/auth/login/', body, headers)
        if (response.success === true) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}
