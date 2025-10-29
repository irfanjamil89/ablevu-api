import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { first } from "rxjs";
import { User } from "src/entity/user.entity";
import { UserDto } from "src/user/user.dto";
import { Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from "src/user/update-password.dto";
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id : id });
  }

  async findByUserName(username: string): Promise<User | null> {
  return this.usersRepository.findOne({ where: { email: username } });
}

  async save(): Promise<void> {
    const user = {
      id: 'dc2be30c-e446-4b63-b48f-9622a80f3e1c',
      firstName: 'sds',
      lastName: 'sdsd'
    };
    await this.usersRepository.save(user);
  }

  async signUp(dto: UserDto) {
    const exists = await this.usersRepository.findOne({ where: { email: dto.emailAddress } });
    console.log('exists', dto.emailAddress);
    if (exists) {
      throw new DOMException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
console.log(dto);
     var userData = {
      email: dto.emailAddress.toLowerCase(),
      first_name: dto.firstName.trim() || "",
      last_name: dto.lastName.trim() || "",
      password : passwordHash,
      archived: false,
      created_at: new Date(),
      modified_at: new Date(),
      user_role: dto.userType || 'User',
    }
    console.log(userData);
    const user = this.usersRepository.create(userData);

console.log(user);
    const saved = await this.usersRepository.save(user);


    return {
      id: saved.id,
      email: saved.email,
      firstName: saved.first_name,
      lastName: saved.last_name,
      createdAt: saved.created_at,
    };
  }
  


  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
  
   async updatePassword(userId: string, dto: UpdatePasswordDto){
    const existingUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, existingUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    existingUser.password = hashedPassword;
    existingUser.modified_at = new Date();

    await this.usersRepository.save(existingUser);
  }
    async changeUserRole(userId: string, targetRole: string){
    const requestingUser = await this.usersRepository.findOne({where: { id: userId }});
    if (!requestingUser) { throw new BadRequestException('user not found'); }
      requestingUser.user_role = targetRole;
      await this.usersRepository.save(requestingUser);
  }
}
function uuidv4(): string | undefined {
  throw new Error("Function not implemented.");
}