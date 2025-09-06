import { IsNotEmpty } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { HydratedDocument } from 'mongoose';
import { BaseEntity } from 'src/base/base.entity';
import { GenderUser } from 'src/utils/GenderUser';
import { RoleUser } from 'src/utils/RoleUser';
import { StatusUser } from 'src/utils/StatusUser';


export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: {
    createdAt: true,
    updatedAt: true
} })
export class User extends BaseEntity {
	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (first_name: string) => {
			return first_name.trim();
		},
	})
	firstName: string;

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (last_name: string) => {
			return last_name.trim();
		},
	})
	lastName: string;

	@Expose({ name: 'full_name' })
	get fullName(): string {
		return `${this.firstName} ${this.lastName}`;
	}

	@Prop({ type: String, enum: GenderUser }) 
	gender: string; 

	@Prop({ required: true, unique: true, match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/ })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop({ required: true })
	DOB: Date;

	@Prop({ required: true, type: String, enum: RoleUser })
	role: string;

	@Prop({ required: true, match: /^\d{10}$/ })
	phoneNumber: string;

	@Prop({ required: false, type: String, default: null })
	refreshToken: string | null;

	@Prop({ type: String, enum: StatusUser, required: true })
	status: StatusUser;

}

export const UserSchema = SchemaFactory.createForClass(User);
