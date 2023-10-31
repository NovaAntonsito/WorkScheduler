import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const userRepository = AppDataSource.getRepository(User);


const deleteUser = async (User : User) => {
    try {
        await userRepository.delete(User)
        return true
    } catch (error) {
        console.error(`Error al eliminar el usuario: ${error}`);
        throw new Error('Error al eliminar el usuario');
    }
}

const viewOneUser = async (userName : string) =>{
    try {
        const userFound = await userRepository.findOne({
            where: {
                nombre : userName
            }
        })
        if(userFound){
            return userFound
        }
        return;
    } catch (error) {
        console.error(`Error al encontrar el usuario: ${error}`);
        throw new Error('Error al encontrar el usuario');
    }
}

const viewAllUsers = async (pageNumber : number, order? : boolean) =>{
    try {
        const orderBy = order ? "ASC" : "DESC"
        const [allUsers , totalRecords] = await userRepository.findAndCount({
            skip: (pageNumber - 1) * 5,
            take: 5,
            order: {
                nombre: orderBy
            }
        })
        if(allUsers.length === 0) throw new Error("No hay usuarios en la base de datos")
        return {
            data: allUsers,
            perPage: 5,
            totalRecords: totalRecords,
            next: pageNumber + 1,
            previous: pageNumber <= 0 ? 0 : pageNumber - 1
        };
    } catch (error) {
        console.error(`Error al encontrar usuarios: ${error}`);
        throw new Error('Error al encontrar usuarios');
    }
}




export {deleteUser, viewOneUser, viewAllUsers}