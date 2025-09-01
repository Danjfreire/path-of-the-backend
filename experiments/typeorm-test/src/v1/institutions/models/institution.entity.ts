import { Classroom } from 'src/v1/classrooms/models/classroom.entity';
import { School } from 'src/v1/schools/models/school.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Institution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany((type) => School, (school) => school.institution)
  schools: School[];
}
