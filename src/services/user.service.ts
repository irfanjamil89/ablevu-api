import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "crypto";
import { first } from "rxjs";
import { User } from "src/entity/user.entity";
import { UserDto } from "src/user/user.dto";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from "src/user/dto/update-profile.dto";


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

   async updateProfile(userId: number | string, dto: UpdateProfileDto) {
    const user = await this.usersRepository.findOne({ where: { id: String(userId) } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.firstName !== undefined) {
      user.first_name = dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      user.last_name = dto.lastName.trim();
    }

    if (dto.email !== undefined) {
      const newEmail = dto.email.toLowerCase().trim();
      if (newEmail !== user.email) {
        const exists = await this.usersRepository.exists({ where: { email: newEmail } });
        if (exists) throw new ConflictException('Email already in use');
        user.email = newEmail;
      }
    }

    if (dto.phoneNumber !== undefined) {
      user.phone_number = dto.phoneNumber.trim();
    }

    await this.usersRepository.save(user);

    return {
      message: 'Profile updated successfully',
      updatedUser: user,
    };
  }
  }

function uuidv4(): string | undefined {
  throw new Error("Function not implemented.");
}