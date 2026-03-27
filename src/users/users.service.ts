import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { ApiResponse } from 'src/types/api-response.interface';
import { User } from 'src/types/user.type';
import { ListQuery } from 'src/common/types/list-query.type';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) { }

  create(createUserDto: CreateUserDto): ApiResponse<User> {
    const newUser: User = {
      id: (this.usersRepository.findAll().length + 1).toString(),
      name: createUserDto.name,
      email: createUserDto.email,
    };
    const created = this.usersRepository.create(newUser);
    return {
      status: 201,
      message: 'User created',
      data: created,
    };
  }

  findAll(params?: ListQuery): ApiResponse<User[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const requestedLimit = Number(params?.limit) || 10;
    const limit = Math.min(Math.max(1, requestedLimit), 50);
    const searchKeyword = (params?.search ?? '').toString().trim().toLowerCase();
    const sortOrder: 'asc' | 'desc' = params?.sortOrder === 'desc' ? 'desc' : 'asc';
    const isValidSortField = (field: unknown): field is 'name' | 'email' | 'id' =>
      field === 'name' || field === 'email' || field === 'id';
    const sortBy: 'name' | 'email' | 'id' = isValidSortField(params?.sortBy)
      ? (params!.sortBy! as 'name' | 'email' | 'id')
      : 'name';

    const allUsers = this.usersRepository.findAll();

    const filteredUsers = searchKeyword
      ? allUsers.filter((user) => {
        const nameLower = user.name?.toLowerCase() ?? '';
        const emailLower = user.email?.toLowerCase() ?? '';
        return nameLower.includes(searchKeyword) || emailLower.includes(searchKeyword);
      })
      : allUsers;

    const sortedUsers = filteredUsers.slice().sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        const aId = Number(a.id);
        const bId = Number(b.id);
        comparison = !Number.isNaN(aId) && !Number.isNaN(bId) ? aId - bId : String(a.id).localeCompare(String(b.id));
      } else if (sortBy === 'email') {
        comparison = String(a.email ?? '').localeCompare(String(b.email ?? ''), undefined, { sensitivity: 'base' });
      } else {
        comparison = String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, { sensitivity: 'base' });
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = sortedUsers.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const pagedUsers = sortedUsers.slice(offset, offset + limit);

    return {
      status: 200,
      message: 'List of all users',
      data: pagedUsers,
      meta: { page, limit, total, totalPages },
    };
  }

  findOne(id: string): ApiResponse<User> {
    const user = this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'User found',
      data: user,
    };
  }

  update(id: string, updateUserDto: UpdateUserDto): ApiResponse<User> {
    const updated = this.usersRepository.update(id, updateUserDto);
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'User updated',
      data: updated,
    };
  }

  remove(id: string): ApiResponse<null> {
    const deleted = this.usersRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'User deleted',
    };
  }
}
