import { randomUUID } from "node:crypto";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, Entity } from "typeorm";

@Entity({ name: 'snow_test_register' })
export class SnowTestRegister {
        @PrimaryGeneratedColumn()
        id: number;
    
        @Column({ type: 'varchar', length: 320 })
        email: string;
    
        @Column()
        firstname: string;
    
        @Column()
        lastname: string;
    
        @Column()
        expertise: string;

        @Column()
        communitySize: number;

        @Column('simple-array')
        platforms: string[];

        @Column({ nullable: true })
        referrer: string;
    
        @Column({ unique: true })
        referral: string;
    
        
    
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

        @BeforeInsert()
        lowercase() {
            this.referral = randomUUID().replace(/-/g, '').slice(0, 8);
        }
}
