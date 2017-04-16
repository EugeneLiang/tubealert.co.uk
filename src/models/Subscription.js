"use strict";

const TABLE_NAME_SUBSCRIPTIONS = "tubealert.co.uk_subscriptions";

class Subscription {
    constructor(documentClient, batchWriteHelper, timeSlotsHelper, logger) {
        this.documentClient = documentClient;
        this.batchWriteHelper = batchWriteHelper;
        this.timeSlotsHelper = timeSlotsHelper;
        this.logger = logger;

        this.batchWriter = new this.batchWriteHelper(this.documentClient, TABLE_NAME_SUBSCRIPTIONS, this.logger);
    }

    subscribeUser(userID, lineID, timeSlots, subscription, now) {
        // process the time slots
        const slots = new this.timeSlotsHelper(timeSlots);

        // create the PUT items
        const puts = slots.getPuts(subscription, lineID, now);
        this.logger.info(puts.length + " puts");

        // find out any that need to be deleted
        return this.getUserSubscriptions(userID, lineID)
            .then(data => {
                const deletes = slots.getDeletes(data);
                this.logger.info(deletes.length + " deletes");
                return puts.concat(deletes);
            })
            .then(requests => this.batchWriter.makeRequests(requests));
    }

    unsubscribeUser(userID) {
        return this.getUserSubscriptions(userID)
            .then(data => {
                const requests = data.map(this.createDeleteRequest);
                this.logger.info(requests.length + ' items total');
                return requests;
            })
            .then(requests => this.batchWriter.makeRequests(requests));
    }

    getUserSubscriptions(userID) {
        const params = {
            TableName: TABLE_NAME_SUBSCRIPTIONS,
            KeyConditionExpression: "#user = :user",
            ExpressionAttributeNames: {
                "#user": "UserID"
            },
            ExpressionAttributeValues: {
                ":user": userID
            }
        };

        return this.documentClient.query(params).promise()
            .then(result => result.Items);
    }

    getSubscriptionsForLineSlot(lineID, date) {
        const lineSlot = this.makeLineSlot(lineID, date);
        this.logger.info("Line slot: " + lineSlot);
        const params = {
            TableName: TABLE_NAME_SUBSCRIPTIONS,
            IndexName: "index_lineSlot",
            KeyConditionExpression: "#line = :line",
            ExpressionAttributeNames: {
                "#line": "LineSlot"
            },
            ExpressionAttributeValues: {
                ":line": lineSlot
            }
        };
        return this.documentClient.query(params).promise()
            .then(result => (result.Items));
    }

    getSubscriptionsStartingInLineSlot(lineID, date) {
        const hour = date.hours();
        const lineSlot = this.makeLineSlot(lineID, date);
        this.logger.info("Line slot: " + lineSlot);
        const params = {
            TableName: TABLE_NAME_SUBSCRIPTIONS,
            IndexName: "index_lineSlot",
            KeyConditionExpression: "#line = :line",
            FilterExpression : "#start = :start",
            ExpressionAttributeNames: {
                "#line": "LineSlot",
                "#start": "WindowStart"
            },
            ExpressionAttributeValues: {
                ":line": lineSlot,
                ":start": hour
            }
        };
        return this.documentClient.query(params).promise()
            .then(result => (result.Items));
    }

    makeLineSlot(lineID, date) {
        return lineID + "_0" + date.day() + date.format('HH');
    }

    createDeleteRequest(item) {
        return {
            DeleteRequest: {
                Key: {
                    UserID: item.UserID,
                    LineSlot: item.LineSlot
                }
            }
        }
    }
}

module.exports = Subscription;
