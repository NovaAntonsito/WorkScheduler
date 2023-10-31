import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombre: string

    @Column()
    sucursal : string

    @Column()
    horario : string

    @Column()
    email : string

    @Column({default: false})
    esPermanente : boolean
    
    @Column({default: false})
    esJefecito : boolean
}