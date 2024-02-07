export const types = /*graphql*/ `
type User{
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    profileImageUrl: String
    createdAt: String!
    updatedAt: String!
    tweets: [Tweet]
}
    `