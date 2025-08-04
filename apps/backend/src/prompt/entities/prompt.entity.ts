import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Prompt {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ type: 'text' })
	description: string;

	@Column({ length: 50 })
	platform: string;

	@Column({ type: 'decimal', precision: 3, scale: 2 })
	temperature: number;

	@Column({ type: 'decimal', precision: 3, scale: 2 })
	top_p: number;

	@Column({ type: 'jsonb' })
	messages: any[];

	@Column({ type: 'jsonb' })
	response_format: any;

	@Column({ default: false })
	is_public: boolean;

	@Column({ length: 100, default: 'llama3.1-8b-instruct' })
	model_name: string;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'created_by' })
	created_by: User;

	@Column()
	created_by_id: number;

	@CreateDateColumn({
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP(6)',
	})
	created_at: Date;

	@UpdateDateColumn({
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP(6)',
		onUpdate: 'CURRENT_TIMESTAMP(6)',
	})
	updated_at: Date;
}
