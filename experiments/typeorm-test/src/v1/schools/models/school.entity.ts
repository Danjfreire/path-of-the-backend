import { Classroom } from 'src/v1/classrooms/models/classroom.entity';
import { Institution } from 'src/v1/institutions/models/institution.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'institution_id', nullable: false })
  institutionId: number;

  @ManyToOne(() => Institution, (institution) => institution.schools)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @OneToMany(() => Classroom, (classroom) => classroom.school)
  classrooms: Classroom[];
}
