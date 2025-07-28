export const NormalTree = {
  id: '1',
  children: [
    {
      id: '2',
    },
    {
      id: '3',
      children: [
        {
          id: '5',
          children: [
            {
              id: '8',
            },
            {
              id: '9',
            },
          ],
        },
        {
          id: '6',
        },
        {
          id: '7',
          children: [
            {
              id: '10',
            },
          ],
        },
      ],
    },
    {
      id: '4',
    },
  ],
}

export const SingleNodeTree = {
  id: '1',
}

export const EmptyIdTree = {
  id: '',
}

export const SameIdTree = {
  id: '1',
  children: [
    {
      id: '2',
    },
    {
      id: '3',
      children: [
        {
          id: '5',
          children: [
            {
              id: '8',
            },
            {
              id: '9',
            },
          ],
        },
        {
          id: '1',
        },
        {
          id: '7',
        },
      ],
    },
    {
      id: '4',
    },
  ],
}
export const SameChildIdTree = {
  id: '1',
  children: [
    {
      id: '2',
    },
    {
      id: '4',
    },
    {
      id: '2',
    },
  ],
}
