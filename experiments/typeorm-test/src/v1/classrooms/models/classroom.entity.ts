import { School } from 'src/v1/schools/models/school.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  code: string;

  @Column({ name: 'school_id', nullable: false })
  schoolId: number;

  @ManyToOne(() => School, (school) => school.classrooms, { nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @CreateDateColumn()
  createdAt: Date;
}
