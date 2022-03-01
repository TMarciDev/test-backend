import mongoose from 'mongoose'

const {Schema} = mongoose

const subscriptionSchema = new Schema({
    data: []

        

})

export default mongoose.model('Subscription', subscriptionSchema)