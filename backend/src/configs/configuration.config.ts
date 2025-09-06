export const database_config = () => ({
	database: {
		uri: process.env.DATABASE_URI as string
	},
});